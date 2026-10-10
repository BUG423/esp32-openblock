use std::{
    cell::RefCell,
    net::TcpStream,
    rc::Rc,
    sync::{Arc, Mutex},
};

use anyhow::Result;
use websocket::{
    sync::{Server, Writer},
    OwnedMessage,
};

pub type Sender = Arc<Mutex<Writer<TcpStream>>>;
pub trait WsServerService {
    fn get_server_addr(&self) -> &str;

    fn ws_text_handle(&self, sender: Sender, text: String) -> Result<()>;

    fn ws_binary_handle(&self, sender: Sender, data: Vec<u8>) -> Result<()>;

    fn ws_close_handle(&self) -> Result<()> {
        Ok(())
    }

    // fn ws_send_message(&self, sender: Sender, message: OwnedMessage) -> Result<()> {
    //     let mut sender = sender.borrow_mut();
    //     sender.send_message(&message)?;
    //     Ok(())
    // }

    /// 维护一个 websocket task
    fn ws_task(&self) -> Result<()> {
        let addr = self.get_server_addr();
        let server = Server::bind(addr).unwrap();
        println!("Server start at {}", addr);

        for req in server.filter_map(Result::ok) {
            let client = req.accept().expect("Client accept error.");
            let cli_ip = client.peer_addr()?;
            println!("Connection from {}", cli_ip);

            let (mut receiver, sender) = client.split()?;
            let sender = Arc::new(Mutex::new(sender));
            for message in receiver.incoming_messages().filter_map(Result::ok) {
                match message {
                    OwnedMessage::Close(data) => {
                        let message = OwnedMessage::Close(data);
                        let sender = sender.clone();
                        let mut sender = sender.lock().unwrap();
                        sender.send_message(&message)?;
                        println!("Client {} disconnected", cli_ip);
                        self.ws_close_handle()?;
                        break;
                    }
                    OwnedMessage::Ping(ping) => {
                        let message = OwnedMessage::Pong(ping);
                        let sender = sender.clone();
                        let mut sender = sender.lock().unwrap();
                        sender.send_message(&message)?;
                    }
                    OwnedMessage::Text(text) => self.ws_text_handle(sender.clone(), text)?,
                    OwnedMessage::Binary(data) => self.ws_binary_handle(sender.clone(), data)?,
                    _ => {}
                }
            }
        }

        Ok(())
    }
}
