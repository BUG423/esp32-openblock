use std::{collections::HashSet, time::Duration};

use crate::mpy::{mpy_agent::MpyAgent, mpy_io::MpyIO, MpyControl};
use anyhow::Result;
use serialport::{SerialPort, SerialPortType};

#[derive(Debug, Default)]
pub struct UsbSerial {
    port_name: String,
    baud_rate: u32,
    serial: Option<Box<dyn SerialPort>>,
    is_read: bool,
}

impl UsbSerial {
    pub fn new(port_name: String, baud_rate: u32) -> Self {
        Self {
            port_name,
            baud_rate,
            is_read: false,
            serial: None,
        }
    }

    pub fn open(&mut self) -> Result<()> {
        let serial = serialport::new(&self.port_name, self.baud_rate)
            .timeout(Duration::from_millis(100))
            .open()?;
        self.serial.replace(serial);
        Ok(())
    }

    pub fn _close(&mut self) -> Result<()> {
        drop(self.serial.take());
        Ok(())
    }
}

impl MpyIO for UsbSerial {
    fn write(&mut self, buf: &[u8]) -> Result<usize> {
        let serial = self.serial.as_mut().unwrap();
        Ok(serial.write(buf)?)
    }
    fn write_all(&mut self, buf: &[u8]) -> Result<()> {
        let serial = self.serial.as_mut().unwrap();
        Ok(serial.write_all(buf)?)
    }
    fn read(&mut self, buf: &mut [u8]) -> Result<usize> {
        let serial = self.serial.as_mut().unwrap();

        Ok(serial.read(buf)?)
    }

    fn read_exact(&mut self, size: usize) -> Result<Vec<u8>> {
        let mut buf = vec![0; size];
        let serial = self.serial.as_mut().unwrap();
        serial.read_exact(&mut buf)?;
        Ok(buf)
    }
}

impl MpyAgent for UsbSerial {}

impl MpyControl for UsbSerial {
    fn connect(&mut self) -> Result<()> {
        self.open()?;
        self.enter_raw_repl(true)?;
        Ok(())
    }

    fn read_task_start(&mut self) -> Result<()> {
        if self.is_read {
            // 需要发送数据的权限。
            // 需要不断从设备读取数据的权限
            // 同时需要维持接收指令的状态。
        };
        Ok(())
    }

    fn read_task_abort(&mut self) -> Result<()> {
        Ok(())
    }
}

/// 查找设备
pub fn usb_discover(filters: Vec<String>) -> Result<Vec<(String, String)>> {
    let ports = serialport::available_ports().unwrap();

    let mut device_unique = HashSet::new();
    let use_serial_port = ports
        .into_iter()
        .filter_map(|p| match p.port_type {
            //const pnpid = `USB\\VID_${vendorId}&PID_${productId}`;
            SerialPortType::UsbPort(info) => {
                let vendor_id = info.vid.to_string().to_uppercase();
                let product_id = info.pid.to_string().to_uppercase();
                let _pnpid = format!("USB\\VID_{vendor_id}&PID_{product_id}");

                if device_unique.contains(&_pnpid) {
                    None
                } else {
                    device_unique.insert(_pnpid);
                    // filter
                    println!("filter: {:?}", filters);
                    Some((
                        info.product.unwrap_or("Unknow".to_string()),
                        p.port_name.to_string(),
                    ))
                }
            }
            _ => None,
        })
        .collect::<Vec<_>>();
    Ok(use_serial_port)
}
