//{"peripheralId":"/dev/cu.wchusbserial120","peripheralConfig":{"config":{"baudRate":9600}}}
#[derive(Debug, serde::Deserialize)]
#[allow(dead_code)]
pub struct OBConnect {
    #[serde(rename = "peripheralId")]
    pub peripheral_id: String,
    #[serde(rename = "peripheralConfig")]
    pub peripheral_config: OBPeripheralConfig,
}

#[derive(Debug, serde::Deserialize)]
pub struct OBPeripheralConfig {
    #[allow(dead_code)]
    pub config: OBConfig,
}
#[derive(Debug, serde::Deserialize)]
pub struct OBConfig {
    #[allow(dead_code)]
    #[serde(rename = "baudRate")]
    pub baud_rate: u32, // 115200
}
