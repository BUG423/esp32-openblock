use crate::mpy::{mpy_agent::MpyAgent, mpy_io::MpyIO};
use anyhow::Result;
use core::time;
use std::{
    collections::VecDeque,
    io::{BufReader, Write},
    net::TcpStream,
    sync::{mpsc, Arc, Mutex},
    thread::sleep,
    time::Duration,
};
use websocket::{sync::Client, ClientBuilder, Message, OwnedMessage};

pub struct WifiWebsocket {
    chann_tx: mpsc::Sender<OwnedMessage>, // 发送数据
    recv_buf: Arc<Mutex<VecDeque<u8>>>,
}

impl WifiWebsocket {
    pub fn new(conn: &str) -> Result<Self> {
        let client = ClientBuilder::new(conn)?.connect_insecure()?;

        let (mut receiver, mut sender) = client.split().unwrap();
        let (msg_tx, cli_rx) = mpsc::channel();
        let recv_buf = Arc::new(Mutex::new(VecDeque::new()));

        let _send_handle = std::thread::spawn(move || {
            // Send loop
            loop {
                let message = match cli_rx.recv() {
                    Ok(m) => m,
                    Err(e) => {
                        println!("Send Loop: {:?}", e);
                        return;
                    }
                };
                match message {
                    OwnedMessage::Close(_) => {
                        let _ = sender.send_message(&message);
                        // If it's a close message, just send it and then return.
                        return;
                    }
                    OwnedMessage::Text(ref _s) => {}
                    _ => (),
                }

                //
                match sender.send_message(&message) {
                    Ok(()) => (),
                    Err(e) => {
                        println!("Send Loop: {:?}", e);
                        let _ = sender.send_message(&Message::close());
                        return;
                    }
                }
            }
        });

        let inner_tx = msg_tx.clone();
        let buf = recv_buf.clone();
        let _receive_loop = std::thread::spawn(move || {
            // Receive loop
            for message in receiver.incoming_messages() {
                let message = match message {
                    Ok(m) => m,
                    Err(e) => {
                        println!("Receive Loop: {:?}", e);
                        let _ = inner_tx.send(OwnedMessage::Close(None));
                        return;
                    }
                };
                match message {
                    OwnedMessage::Close(_) => {
                        // Got a close message, so send a close message and return
                        let _ = inner_tx.send(OwnedMessage::Close(None));
                        return;
                    }
                    OwnedMessage::Ping(data) => {
                        match inner_tx.send(OwnedMessage::Pong(data)) {
                            // Send a pong in response
                            Ok(()) => (),
                            Err(e) => {
                                println!("Receive Loop: {:?}", e);
                                return;
                            }
                        }
                    }
                    // Say what we received
                    OwnedMessage::Text(s) => {
                        println!("Receive Loop: {:?}", s);
                        s.as_bytes().iter().for_each(|&b| {
                            let mut recv_buf = buf.lock().unwrap();
                            recv_buf.push_back(b);
                        });
                    }
                    _ => {}
                }
            }
        });

        Ok(Self {
            chann_tx: msg_tx,
            recv_buf,
        })
    }

    pub fn auth(&mut self, pass: &str) -> anyhow::Result<()> {
        self.read_until(1, b"Password:")?;
        let pass = format!("{}\r\n", pass);
        self.write(pass.as_bytes())?;

        self.read_until(1, b">>> ")?;
        println!("Auth success.");
        Ok(())
    }
}

impl MpyIO for WifiWebsocket {
    fn read(&mut self, buf: &mut [u8]) -> Result<usize> {
        // let self.client.
        let mut recv_buf = self.recv_buf.lock().unwrap();
        let n = recv_buf.len().min(buf.len());
        let mut read_size = 0;
        for i in 0..n {
            if let Some(b) = recv_buf.pop_front() {
                buf[i] = b;
                read_size += 1;
            } else {
                break;
            }
        }
        Ok(read_size)
    }

    fn read_exact(&mut self, size: usize) -> Result<Vec<u8>> {
        let mut buf = vec![0; size];
        let mut timeout_count = 3;
        let mut read_size = 0;
        println!("read_exact size {}", size);

        loop {
            if let Some(b) = {
                let mut recv_buf = self.recv_buf.lock().unwrap();
                recv_buf.pop_front()
            } {
                buf[read_size] = b;
                read_size += 1;
            } else {
                sleep(Duration::from_millis(10));
                timeout_count -= 1;
            }
            if read_size == size {
                break;
            }
            if timeout_count <= 0 {
                anyhow::bail!("Timeout in read exact.")
            }
        }
        Ok(buf)
    }

    fn write(&mut self, buf: &[u8]) -> Result<usize> {
        self.chann_tx.send(OwnedMessage::Binary(buf.to_vec()))?;
        Ok(buf.len())
    }

    fn write_all(&mut self, buf: &[u8]) -> Result<()> {
        self.write(buf)?;
        Ok(())
    }
}

impl MpyAgent for WifiWebsocket {}
