use super::async_ws::Senderable;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Request {
    /// The name of the RPC call.
    pub method: String,
    /// Parameters to the RPC call.
    pub params: Option<Value>,
    /// Identifier for this request, which should appear in the response.
    pub id: serde_json::Value,
    /// jsonrpc field, MUST be "2.0".
    pub jsonrpc: Option<String>,
}

impl Request {
    pub fn from_method(id: usize, method: &str) -> Self {
        Self {
            method: String::from(method),
            params: None,
            id: serde_json::Value::from(id),
            jsonrpc: Some(String::from("2.0")),
        }
    }

    pub fn with_params<S: Serialize>(mut self, params: &S) -> Self {
        self.params = Some(serde_json::to_value(params).unwrap());
        self
    }
}

impl Senderable for Request {}
