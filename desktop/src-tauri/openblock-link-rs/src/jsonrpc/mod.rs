pub mod async_rpc;
pub mod async_ws;
pub mod request;
pub mod response;
// pub mod ws;

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(untagged)]
pub enum RpcReceive {
    Response(response::Response),
    Request(request::Request),
    Nothing,
}
