use futures_util::{SinkExt, StreamExt};
use log::*;
use std::net::SocketAddr;
use tokio::{
    net::{TcpListener, TcpStream},
    sync::mpsc,
};
use tokio_tungstenite::{
    accept_async,
    tungstenite::{Error, Message, Result},
};

pub type Sender = mpsc::Sender<Message>;
pub trait AsyncWS {
    async fn listen(&self, addr: &str) -> anyhow::Result<()> {
        let listener = TcpListener::bind(&addr).await.expect("Can't listen");

        info!("Listening on: {}", addr);

        while let Ok((stream, _)) = listener.accept().await {
            let peer = stream
                .peer_addr()
                .expect("connected streams should have a peer address");
            info!("Peer address: {}", peer);

            self.accept_connection(peer, stream).await;
        }
        Ok(())
    }

    async fn accept_connection(&self, peer: SocketAddr, stream: TcpStream) {
        if let Err(e) = self.handle_connection(peer, stream).await {
            match e {
                Error::ConnectionClosed | Error::Protocol(_) | Error::Utf8(_) => {
                    info!("Connection closed")
                }
                err => error!("Error processing connection: {}", err),
            }
        }
    }

    async fn handle_connection(&self, _peer: SocketAddr, stream: TcpStream) -> Result<()> {
        let ws_stream = accept_async(stream).await.expect("Failed to accept");
        let (mut sender, mut receiver) = ws_stream.split();

        let (tx, mut rx) = mpsc::channel::<Message>(32);

        let send_task = async {
            while let Some(msg) = rx.recv().await {
                if let Message::Text(text) = msg.clone() {
                    info!("SEND: {:?}", text);
                }
                if sender.send(msg).await.is_err() {
                    break;
                }
            }
            warn!("All Sender dropped, closing connection");
        };

        let recv_task = async {
            while let Some(msg) = receiver.next().await {
                let msg = match msg {
                    Ok(msg) => msg,
                    Err(e) => {
                        error!("Error receiving a message: {}", e);
                        break;
                    }
                };

                match msg {
                    Message::Text(text) => {
                        info!("RECV: {:?}", text);
                        match self.ws_text_handler(tx.clone(), text.to_string()).await {
                            Ok(_) => (),
                            Err(e) => {
                                error!("Error processing text message: {}", e);
                            }
                        };
                    }
                    Message::Binary(data) => {
                        match self.ws_binary_handler(tx.clone(), data.to_vec()).await {
                            Ok(_) => (),
                            Err(e) => {
                                error!("Error processing binary message: {}", e);
                            }
                        };
                    }
                    Message::Close(_) => {
                        let _ = tx.send(Message::Close(None)).await;
                        drop(tx);
                        break;
                    }
                    Message::Ping(ping) => {
                        let _ = tx.send(Message::Pong(ping)).await;
                    }
                    _ => (),
                }
            }
            warn!("{} disconnected", _peer);
        };

        tokio::select! {
            _ = send_task => (),
            _ = recv_task => (),
        }

        self.ws_close_handler().await;
        Ok(())
    }
    async fn ws_text_handler(&self, _sender: Sender, text: String) -> anyhow::Result<()>;
    async fn ws_binary_handler(&self, sender: Sender, data: Vec<u8>) -> anyhow::Result<()>;
    async fn ws_close_handler(&self);
}

/// A trait for sending data.
pub trait Senderable: serde::Serialize {
    async fn send(&self, sender: &Sender) -> anyhow::Result<()> {
        let content = serde_json::to_string(&self).unwrap();
        sender.send(Message::Text(content.into())).await?;
        Ok(())
    }
}
