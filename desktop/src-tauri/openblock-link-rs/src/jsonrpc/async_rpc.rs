use crate::io::usb_serial::{usb_discover, UsbSerial};
use crate::jsonrpc::async_ws::Senderable;
use crate::mpy::mpy_agent::MpyAgent;
use crate::mpy::mpy_io::MpyIO;
use crate::mpy::MpyControl;

use super::async_ws::{AsyncWS, Sender};
use super::request::Request;
use super::response::Response;
use super::RpcReceive;
use base64::prelude::*;
use log::*;
use serde_json::json;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tokio::task::JoinHandle;

use anyhow::Result;

#[derive(Debug, Default)]
pub struct SendCounter {
    pub counter: Mutex<usize>,
}
impl SendCounter {
    pub fn next(&self) -> usize {
        let mut counter = self.counter.lock().unwrap();
        *counter += 1;
        counter.to_owned()
    }
}

#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    #[default]
    Init,
    Ready,
    Running,
    Close,
}
#[derive(Debug, Default)]
pub struct DeviceManagerInner {
    devices: Option<UsbSerial>,
    status: Status,
    handle: Option<JoinHandle<()>>,
}
impl DeviceManagerInner {
    #[inline]
    pub fn is_running(&self) -> bool {
        self.status == Status::Running
    }

    #[inline]
    pub fn release_device(&mut self) {
        self.status = Status::Close;
        drop(self.devices.take());
    }
}
#[derive(Debug, Default)]
pub struct DeviceManager {
    inner: Arc<Mutex<DeviceManagerInner>>,
}

impl DeviceManager {
    pub fn get_status(&self) -> Status {
        let guard = self.inner.lock().unwrap();
        guard.status
    }

    pub fn set_status(&self, status: Status) {
        let mut guard = self.inner.lock().unwrap();
        guard.status = status;
    }

    pub fn set_device(&self, device: UsbSerial) -> Result<()> {
        if let Ok(mut guard) = self.inner.lock() {
            guard.devices.replace(device);
            Ok(())
        } else {
            anyhow::bail!("Failed to set device.");
        }
    }

    pub fn release_device(&self) {
        let mut guard = self.inner.lock().unwrap();
        guard.release_device();
    }

    pub fn replace_handle(&self, handle: Option<JoinHandle<()>>) {
        let mut guard = self.inner.lock().unwrap();
        match handle {
            Some(handle) => {
                guard.handle.replace(handle);
            }
            None => {
                guard.handle.take();
            }
        }
    }

    pub fn ready(&self) -> anyhow::Result<()> {
        let mut guard = self.inner.lock().unwrap();
        if let Some(device) = guard.devices.as_mut() {
            device.enter_raw_repl(true)?;
            guard.status = Status::Ready;
            Ok(())
        } else {
            anyhow::bail!("Device is not connected.");
        }
    }

    pub async fn run(&self, code: &[u8], outputer: Outputer) -> anyhow::Result<()> {
        if self.get_status() == Status::Running {
            self.task_abort()?;
            warn!("Task is running, abort it.");
            while {
                let guard = self.inner.lock().unwrap();
                guard.handle.is_some()
            } {
                tokio::time::sleep(Duration::from_millis(10)).await;
            }
        }
        {
            let mut guard = self.inner.lock().unwrap();

            if guard.devices.is_none() {
                anyhow::bail!("Device is not connected.");
            }
            let device = guard.devices.as_mut().unwrap();
            // device.upload_raw(code)?;

            device.upload_and_save(code)?;
        }

        let inner = self.inner.clone();
        let task = async move {
            let ending = b"\x04";
            let mut buf = vec![0; 4096];
            let mut len = 0;

            // start
            outputer.nprint(b"--------------\n").await.ok();
            // print
            while {
                let guard = inner.lock().unwrap();
                guard.is_running()
            } {
                if let Ok(n) = {
                    let mut guard = inner.lock().unwrap();
                    if let Some(device) = guard.devices.as_mut() {
                        device.read(&mut buf[len..len + 1])
                    } else {
                        break;
                    }
                } {
                    len += n;

                    // flush
                    if buf[..len].ends_with(b"\n") || len >= buf.len() {
                        if outputer.print(&buf[..len]).await.is_err() {
                            error!("Failed to print  {}.", String::from_utf8_lossy(&buf[..len]));
                        } else {
                            info!("Print: {}", String::from_utf8_lossy(&buf[..len]));
                        };
                        len = 0;
                    }

                    if buf[..len].ends_with(ending) {
                        info!("Received stdout ending.");
                        break;
                    }
                } else {
                    tokio::time::sleep(Duration::from_millis(10)).await;
                }
            }

            let mut len = 0;
            // eprint
            while {
                let guard = inner.lock().unwrap();
                guard.is_running()
            } {
                if let Ok(n) = {
                    let mut guard = inner.lock().unwrap();
                    if let Some(device) = guard.devices.as_mut() {
                        device.read(&mut buf[len..len + 1])
                    } else {
                        break;
                    }
                } {
                    len += n;
                    // flush
                    if buf[..len].ends_with(b"\n") || len >= buf.len() {
                        if outputer.eprint(&buf[..len]).await.is_err() {
                            error!("Failed to eprint {}.", String::from_utf8_lossy(&buf[..len]));
                        };
                        len = 0;
                    }
                    if buf[..len].ends_with(ending) {
                        break;
                    }
                } else {
                    tokio::time::sleep(Duration::from_millis(10)).await;
                }
            }

            // end
            outputer.nprint(b"--------------\n").await.ok();
            info!("Task finished.");
            {
                let mut guard = inner.lock().unwrap();
                guard.status = Status::Ready;
                guard.handle.take();
            }
        };

        let handle = tokio::spawn(task);
        self.replace_handle(Some(handle));
        self.set_status(Status::Running);
        Ok(())
    }

    pub fn task_abort(&self) -> anyhow::Result<()> {
        self.set_status(Status::Ready);
        let mut guard = self.inner.lock().unwrap();
        let device = guard.devices.as_mut().unwrap();
        device.task_abort()?;
        Ok(())
    }

    pub fn write(&self, buf: &[u8]) -> anyhow::Result<()> {
        let mut guard = self.inner.lock().unwrap();
        let device = guard.devices.as_mut().unwrap();
        device.write(buf)?;
        Ok(())
    }
}

#[derive(Debug, Clone)]
pub struct Outputer {
    sender: Sender,
    cnt: Arc<SendCounter>,
}

impl Outputer {
    pub fn new(sender: Sender, cnt: Arc<SendCounter>) -> Self {
        Self { sender, cnt }
    }
    pub async fn nprint(&self, message: &[u8]) -> anyhow::Result<()> {
        let message = BASE64_STANDARD.encode(message);
        Request::from_method(self.cnt.next(), "onMessage")
            .with_params(&json!({
               "encoding": "base64",
               "message": message,
               "type": "null",
            }))
            .send(&self.sender)
            .await?;
        Ok(())
    }

    pub async fn print(&self, message: &[u8]) -> anyhow::Result<()> {
        let message = BASE64_STANDARD.encode(message);
        Request::from_method(self.cnt.next(), "onMessage")
            .with_params(&json!({
               "encoding": "base64",
               "message": message,
               "type": "stdout",
            }))
            .send(&self.sender)
            .await?;

        Ok(())
    }

    pub async fn eprint(&self, message: &[u8]) -> anyhow::Result<()> {
        let message = BASE64_STANDARD.encode(message);
        Request::from_method(self.cnt.next(), "onMessage")
            .with_params(&json!({
                "encoding": "base64",
                "message": message,
                "type": "stderr",
            }))
            .send(&self.sender)
            .await?;
        Ok(())
    }
}

pub struct AsyncWsRpcServer {
    server_addr: String,
    id_cnt: Arc<SendCounter>,
    device_manager: DeviceManager,
}

impl AsyncWsRpcServer {
    pub fn new(addr: &str) -> Self {
        let a = async {
            info!("test");
        };

        let mut methods = HashMap::new();
        methods.insert("test".to_string(), a);

        Self {
            server_addr: addr.to_string(),
            id_cnt: Default::default(),
            device_manager: Default::default(),
        }
    }
    #[allow(dead_code)]
    pub async fn run(&self) -> anyhow::Result<()> {
        self.listen(&self.server_addr).await
    }
    #[allow(dead_code)]
    pub fn run_sync(&self) -> anyhow::Result<()> {
        let rt = tokio::runtime::Runtime::new()?;
        rt.block_on(self.listen(&self.server_addr))
    }
}

impl AsyncWS for AsyncWsRpcServer {
    async fn ws_text_handler(
        &self,
        sender: super::async_ws::Sender,
        text: String,
    ) -> anyhow::Result<()> {
        let rpc_recv = if text.contains("method") {
            RpcReceive::Request(serde_json::from_str::<Request>(&text)?)
        } else if text.contains("result") {
            RpcReceive::Response(serde_json::from_str::<Response>(&text)?)
        } else {
            warn!("Invalid request: {:?}", text);
            RpcReceive::Nothing
        };

        match rpc_recv {
            RpcReceive::Request(request) => {
                // received
                Response::from_id(request.id.as_u64().unwrap_or_default())
                    .send(&sender)
                    .await?;

                // 处理请求
                let method = request.method.as_str();
                let params = request.params;

                match method {
                    "discover" => {
                        let params = params.unwrap();
                        let pnpid: Vec<String> =
                            serde_json::from_value(params["filters"]["pnpid"].clone())
                                .unwrap_or_default();
                        let devices = usb_discover(pnpid).unwrap_or_default();
                        for (name, peripheral) in devices {
                            Request::from_method(self.id_cnt.next(), "didDiscoverPeripheral")
                                .with_params(&json!({
                                    "peripheralId": peripheral,
                                    "name": name,
                                }))
                                .send(&sender)
                                .await?;
                        }
                    }
                    "connect" => {
                        let params = params.unwrap();
                        let peripheral_id = params["peripheralId"].as_str().unwrap();
                        let baud_rate = 115200;
                        let mut device = UsbSerial::new(peripheral_id.to_string(), baud_rate);
                        let res = device.connect();
                        match res {
                            Ok(_) => {
                                info!("Connected to {}", peripheral_id);
                                let _ = self.device_manager.set_device(device);
                            }
                            Err(e) => {
                                error!("Failed to connect to {}: {:?}", peripheral_id, e);
                                Request::from_method(self.id_cnt.next(), "connectError")
                                    .with_params(&json!({ "message": e.to_string() }))
                                    .send(&sender)
                                    .await?;
                            }
                        };

                        // ready
                        match self.device_manager.ready() {
                            Ok(_) => {
                                info!("Device Ready");
                            }
                            Err(e) => {
                                error!("Failed to ready: {:?}", e);
                                Request::from_method(self.id_cnt.next(), "connectError")
                                    .with_params(&json!({ "message": e.to_string() }))
                                    .send(&sender)
                                    .await?;
                            }
                        }
                    }
                    "read" => {
                        info!("read");
                    }
                    "upload" => {
                        let params = params.unwrap();
                        let message = params["message"].as_str().unwrap();
                        let _typ = params["config"]["type"].as_str().unwrap();
                        let encoding = params["encoding"].as_str().unwrap();

                        let res = match encoding {
                            "base64" => {
                                let code = BASE64_STANDARD.decode(message.as_bytes())?;
                                //
                                let outputer = Outputer::new(sender.clone(), self.id_cnt.clone());
                                self.device_manager.run(&code, outputer).await
                            }
                            _ => {
                                error!("Not support encoding: {}", encoding);
                                Err(anyhow::Error::msg(format!(
                                    "Not support encoding: {}",
                                    encoding
                                )))
                            }
                        };

                        match res {
                            Ok(_) => {
                                Request::from_method(self.id_cnt.next(), "uploadSuccess")
                                    .with_params(&json!({ "aborted": false }))
                                    .send(&sender)
                                    .await?;
                            }
                            Err(e) => {
                                error!("Failed to upload: {:?}", e);
                                Request::from_method(self.id_cnt.next(), "peripheralUnplug")
                                    .with_params(&json!({ "message": e.to_string() }))
                                    .send(&sender)
                                    .await?;
                            }
                        }
                    }
                    "write" => {
                        let params = params.unwrap();
                        let message = params["message"].as_str().unwrap();
                        let encoding = params["encoding"].as_str().unwrap();
                        let code = match encoding {
                            "base64" => BASE64_STANDARD.decode(message.as_bytes()).unwrap(),
                            _ => {
                                eprintln!("Not support encoding: {}", encoding);
                                return Ok(());
                            }
                        };
                        info!("Write: {:?}", String::from_utf8_lossy(&code));
                        if self.device_manager.get_status() == Status::Running {
                            match code.as_slice() {
                                b"\x03" => {
                                    self.device_manager.write(b"\x03")?;
                                }
                                _ => {
                                    self.device_manager.write(&code)?;
                                }
                            }
                        } else {
                            warn!("Device is not running.");
                        }
                    }
                    "pingMe" => {}
                    _ => {
                        warn!("Unknown method: {:?}", method);
                    }
                }
            }
            RpcReceive::Response(_response) => {}
            RpcReceive::Nothing => {}
        }
        Ok(())
    }

    async fn ws_binary_handler(&self, _sender: Sender, _data: Vec<u8>) -> anyhow::Result<()> {
        Ok(())
    }
    async fn ws_close_handler(&self) {
        log::error!("ws_close_handler");
        self.device_manager.release_device();
    }
}
