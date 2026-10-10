use std::{cell::RefCell, collections::HashMap, rc::Rc};

use super::{
    request::Request,
    response::Response,
    ws::{Sender, WsServerService},
    RpcReceive,
};
use anyhow::Result;
use serde_json::Value;

/// 可调用命令列表。 [Sender] 发送通道, [Option<Box<RawValue>>] 参数列表。
pub type Method = Box<dyn FnMut(Sender, Option<Value>, SenderCounter) -> Result<()>>;
pub type MethodMap = HashMap<String, RefCell<Method>>;

#[derive(Debug, Default, Clone)]
pub struct SenderCounter(Rc<RefCell<usize>>);
impl SenderCounter {
    pub fn get(&self) -> usize {
        let mut counter = self.0.borrow_mut();
        *counter += 1;
        *counter
    }
}

#[derive(Default)]
pub struct WsRpcServer {
    /// websocket监听地址。
    server_addr: String,
    /// default from 0.
    sender_counter: SenderCounter,
    /// default Nothing.
    method_map: MethodMap,
}
impl WsRpcServer {
    pub fn new(addr: &str) -> Self {
        Self {
            server_addr: addr.to_string(),
            ..Default::default()
        }
    }

    pub fn start(&self) -> Result<()> {
        self.ws_task()
    }

    pub fn add_method(&mut self, name: &str, method: Method) {
        self.method_map
            .insert(name.to_string(), RefCell::new(method));
    }
}

impl WsServerService for WsRpcServer {
    fn get_server_addr(&self) -> &str {
        &self.server_addr
    }

    fn ws_text_handle(&self, sender: Sender, text: String) -> Result<()> {
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
