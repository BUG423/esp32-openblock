//! Author: Qi Zhang
//! Date: 2024-06-26
//! Description:
//! This is a simple example to communicate with a serial port.

mod io;
mod jsonrpc;
mod model;
mod mpy;
// mod ob_server;

const SERVER_ADDR: &str = "127.0.0.1:20111";

#[tokio::main]
async fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    let server = jsonrpc::async_rpc::AsyncWsRpcServer::new(SERVER_ADDR);
    server.run().await.unwrap();
}
