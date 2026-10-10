use crate::{
    io::usb_serial::{usb_discover, UsbSerial},
    jsonrpc::{
        request::Request,
        response::Response,
        ws::{Sender, WsServerService},
        RpcReceive,
    },
    mpy::MpyControl,
};
use anyhow::Result;
use base64::prelude::*;
use serde_json::{json, Value};
use std::{
    cell::RefCell,
    collections::HashMap,
    rc::Rc,
    sync::{Arc, Mutex},
    thread::{self, JoinHandle},
};

/// 可调用命令列表。 [Sender] 发送通道, [Option<Box<RawValue>>] 参数列表。
pub type Method = Box<dyn FnMut(Sender, Option<Value>, SenderCounter) -> Result<()>>;
pub type MethodMap = HashMap<String, RefCell<Method>>;

#[derive(Debug, Default, Clone)]
pub struct SenderCounter(Arc<Mutex<usize>>);
impl SenderCounter {
    pub fn get(&self) -> usize {
        let mut counter = self.0.lock().unwrap();
        *counter += 1;
        *counter
    }
}

// #[derive(Default)]
pub struct OBRpcServer {
    /// websocket监听地址。
    server_addr: String,
    /// default from 0.
    sender_counter: SenderCounter,
    /// default Nothing.
    method_map: MethodMap,

    /// mpy control
    mpy_control: Arc<Mutex<Option<Box<dyn MpyControl>>>>,

    /// read_task_handle
    read_task_handle: Rc<RefCell<Option<JoinHandle<()>>>>,
}

impl Default for OBRpcServer {
    fn default() -> Self {
        Self {
            mpy_control: Arc::new(Mutex::new(None)),
            server_addr: String::new(),
            sender_counter: SenderCounter::default(),
            method_map: HashMap::new(),
            read_task_handle: Rc::new(RefCell::new(None)),
        }
    }
}
impl OBRpcServer {
    pub fn new() -> Self {
        Self {
            ..Default::default()
        }
    }
    pub fn with_server_addr(mut self, server_addr: &str) -> Self {
        self.server_addr = server_addr.to_string();
        self
    }

    // pub fn with_mpy_control<M: 'static + MpyControl>(mut self, mpy_control: M) -> Self {
    //     self.mpy_control = Rc::new(RefCell::new(Some(Box::new(mpy_control))));
    //     self
    // }

    pub fn add_method(&mut self, name: &str, method: Method) {
        self.method_map
            .insert(name.to_string(), RefCell::new(method));
    }

    pub fn build(mut self) -> Self {
        self.add_method(
            "discover",
            Box::new(move |sender, params, counter| {
                //{"filters":{"pnpid":["esp32-txd"]}}
                let params = params.unwrap();
                let pnpid: Vec<String> =
                    serde_json::from_value(params["filters"]["pnpid"].clone()).unwrap_or_default();

                let devices = usb_discover(pnpid)?;

                for (name, peripheral) in devices {
                    Request::from_method(counter.get(), "didDiscoverPeripheral")
                        .with_params(&json!({
                            "peripheralId": peripheral,
                            "name": name,
                        }))
                        .send_with_sender(&sender)?;
                }
                Ok(())
            }),
        );

        let mpy_control = self.mpy_control.clone();
        self.add_method(
            "connect",
            Box::new(move |sender, params, counter| {
                // {"peripheralId":"/dev/cu.wchusbserial120","peripheralConfig":{"config":{"baudRate":9600}}}

                let params = params.unwrap();
                let peripheral_id = params["peripheralId"].as_str().unwrap();
                let baud_rate = 115200;
                // let baud_rate = params["peripheralConfig"]["config"]["baudRate"]
                //     .as_u64()
                //     .unwrap_or(baud_rate);

                // 重新传递port

                {
                    let device = UsbSerial::new(peripheral_id.to_string(), baud_rate);
                    let mut mpy_control = mpy_control.lock().unwrap();
                    mpy_control.replace(Box::new(device));
                }

                // open and enter raw repl mode
                match {
                    let mut device = mpy_control.lock().unwrap();
                    let device = device.as_mut().unwrap();
                    device.connect()
                } {
                    Ok(_) => {
                        println!("> Connected to: {}", peripheral_id);
                    }
                    Err(e) => {
                        eprintln!("Error: {:?}", e);
                        Request::from_method(counter.get(), "connectError")
                            .with_params(&json!({ "message": e.to_string() }))
                            .send_with_sender(&sender)?;
                    }
                }

                Ok(())
            }),
        );

        let mpy_control = self.mpy_control.clone();
        self.add_method(
            "read",
            Box::new(move |_sender, _params, _counter| {
                let mut device = mpy_control.lock().unwrap();
                let device = device.as_mut().unwrap();
                device.set_read().unwrap();
                Ok(())
            }),
        );

        let mpy_control = self.mpy_control.clone();
        let read_task_handle = self.read_task_handle.clone();
        self.add_method(
            "upload",
            Box::new(move |sender, params, counter| {
                Request::from_method(counter.get(), "setUploadAbortEnabled")
                    .with_params(&json!(true))
                    .send_with_sender(&sender)?;

                // {"message":"IyBnZW5lcmF0ZWQgYnkgT3BlbkJsb2NrCnBhc3MgIyB0eGQgdGVzdCBib2FyZCBzdGFydAo=","config":{"type":"txdboard"},"encoding":"base64","library":[]}
                println!("{:?}", params);
                let params = params.unwrap();
                let message = params["message"].as_str().unwrap();
                let _typ = params["config"]["type"].as_str().unwrap();
                let encoding = params["encoding"].as_str().unwrap();

                let mut device = mpy_control.lock().unwrap();
                let device = device.as_mut().unwrap();

                let mut read_task_handle = read_task_handle.borrow_mut();
                let read_task_handle = read_task_handle.take();
                match read_task_handle {
                    Some(handle) => {
                        device.task_abort()?;
                        handle.join().unwrap();
                        // 中断程序
                    }
                    None => {}
                }

                match encoding {
                    "base64" => {
                        let code = BASE64_STANDARD.decode(message.as_bytes()).unwrap();
                        device.upload_raw(&code).unwrap();
                    }
                    _ => {
                        eprintln!("Not support encoding: {}", encoding);
                    }
                }

                // 上传完成
                Request::from_method(counter.get(), "uploadSuccess")
                    .with_params(&json!({ "aborted": false }))
                    .send_with_sender(&sender)?;

                let mut device = mpy_control.lock().unwrap();
                let device = device.as_mut().unwrap();
                let _ = device.read_until_with_middle(1, b"\x04", &mut move |data| {
                    // println!("stdout: {:?}", data);
                    Request::from_method(counter.get(), "onMessage")
                        .with_params(&json!({
                            "encoding": "base64",
                            "message": BASE64_STANDARD.encode(data),
                        }))
                        .send_with_sender(&sender)?;
                    Ok(())
                });

                // let sender = sender.clone();
                // let mpy_control = mpy_control.clone();
                let handle = thread::spawn(move || {
                    {
                        // let sender = sender.clone();
                        // let counter = counter.clone();
                        // let device = mpy_control.lock().unwrap();
                        //     let _ = device.read_until_with_middle(1, b"\x04", &mut move |data| {
                        //         // println!("stdout: {:?}", data);
                        //         Request::from_method(counter.get(), "onMessage")
                        //             .with_params(&json!({
                        //                 "encoding": "base64",
                        //                 "message": BASE64_STANDARD.encode(data),
                        //             }))
                        //             .send_with_sender(&sender)?;
                        //         Ok(())
                        //     });
                    }

                    // let _ = device.read_until_with_middle(1, b"\x04", &mut move |data| {
                    //     // println!("stdout: {:?}", data);
                    //     Request::from_method(counter.get(), "onMessage")
                    //         .with_params(&json!({
                    //             "encoding": "base64",
                    //             "type": "stderr",
                    //             "message": BASE64_STANDARD.encode(data),
                    //         }))
                    //         .send_with_sender(&sender)?;
                    //     Ok(())
                    // });
                });

                Ok(())
            }),
        );

        self.add_method(
            "pingMe",
            Box::new(|sender, _params, counter| {
                Request::from_method(counter.get(), "ping")
                    .with_params(&json!(null))
                    .send_with_sender(&sender)?;
                Ok(())
            }),
        );

        let mpy_control = self.mpy_control.clone();
        self.add_method(
            "write",
            Box::new(move |_, params, _| {
                // {"message":"ZXhpdA0K","encoding":"base64"}
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
                println!("write: {:?}", code);
                match code.as_slice() {
                    b"exit" => {
                        let mut device = mpy_control.lock().unwrap();
                        let device = device.as_mut().unwrap();
                        let _ = device.task_abort();
                    }
                    _ => {}
                }

                Ok(())
            }),
        );
        self
    }

    pub fn start(&self) -> Result<()> {
        self.ws_task()
    }
}

impl WsServerService for OBRpcServer {
    fn get_server_addr(&self) -> &str {
        &self.server_addr
    }

    fn ws_close_handle(&self) -> Result<()> {
        let mut mpy_control = self.mpy_control.lock().unwrap();
        drop(mpy_control.take());
        Ok(())
    }

    fn ws_text_handle(&self, sender: Sender, text: String) -> Result<()> {
        println!("R: {}", text);
        let rpc_recv = if text.contains("method") {
            RpcReceive::Request(serde_json::from_str::<Request>(&text).unwrap())
        } else if text.contains("result") {
            RpcReceive::Response(serde_json::from_str::<Response>(&text).unwrap())
        } else {
            eprintln!("error: {:?}", text);
            RpcReceive::Nothing
        };

        match rpc_recv {
            RpcReceive::Request(request) => {
                //
                Response::from_id(request.id.as_u64().unwrap()).send_with_sender(&sender)?;
                match self.method_map.get(&request.method) {
                    Some(method) => {
                        let method = &mut *method.borrow_mut();
                        method(sender, request.params, self.sender_counter.clone())?;
                    }
                    None => {
                        eprintln!("Not found method: {}", request.method);
                    }
                }
            }
            RpcReceive::Response(_response) => {}
            RpcReceive::Nothing => {}
        }

        Ok(())
    }

    fn ws_binary_handle(&self, _sender: Sender, _data: Vec<u8>) -> Result<()> {
        Ok(())
    }
}
