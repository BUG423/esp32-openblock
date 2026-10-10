//! Author: Qi Zhang
mod io;
mod jsonrpc;
mod model;
mod mpy;

pub const SERVER_ADDR: &str = "127.0.0.1:20111";
///
pub use jsonrpc::async_rpc::AsyncWsRpcServer;

pub fn logger_init() {
    let _ = env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .try_init();
}
