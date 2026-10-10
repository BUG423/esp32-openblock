use super::async_ws::Senderable;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Response {
    /// A result if there is one, or [`None`].
    pub result: Option<Value>,
    /// An error if there is one, or [`None`].
    pub error: Option<String>,
    /// Identifier for this response, which should match that of the request.
    pub id: serde_json::Value,
    /// jsonrpc field, MUST be "2.0".
    pub jsonrpc: Option<String>,
}

impl Response {
    pub fn from_id(id: u64) -> Self {
        Self {
            result: None,
            error: None,
            id: serde_json::Value::from(id),
            jsonrpc: Some(String::from("2.0")),
        }
    }

    #[allow(dead_code)]
    pub fn with_result(mut self, result: &str) -> Self {
        self.result = Some(serde_json::to_value(result).unwrap());
        self
    }
    #[allow(dead_code)]
    pub fn with_error(mut self, error: &str) -> Self {
        self.error = Some(String::from(error));
        self
    }
}
impl Senderable for Response {}
