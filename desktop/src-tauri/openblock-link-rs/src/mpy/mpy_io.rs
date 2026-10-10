use anyhow::Result;
use std::thread::sleep;
use std::time::Duration;
// use tokio::time::sleep;

/// data_consumer

pub trait MpyIO {
    // write
    fn write(&mut self, buf: &[u8]) -> Result<usize>;
    fn write_all(&mut self, buf: &[u8]) -> Result<()>;
    // read
    fn read(&mut self, buf: &mut [u8]) -> Result<usize>;
    fn read_exact(&mut self, size: usize) -> Result<Vec<u8>>;
    fn read_to_end(&mut self) -> Result<Vec<u8>> {
        let mut buf = [0; 1024];
        let mut len = 0;
        while let Ok(n) = self.read(&mut buf[len..]) {
            len += n;
        }
        Ok(Vec::from(&buf[..len]))
    }
    fn read_until(&mut self, min_num_bytes: usize, ending: &[u8]) -> Result<Vec<u8>> {
        let mut buf = [0; 1024 * 4];
        let mut len = 0;
        let mut timeout_count = 3;
        loop {
            if let Ok(n) = self.read(&mut buf[len..len + min_num_bytes]) {
                len += n;

                if buf[..len].ends_with(ending) {
                    break;
                }
                // 判断内存是否溢出
                if len + min_num_bytes >= buf.len() {
                    let end_len = ending.len();
                    buf.copy_within(len - end_len..len, 0);
                    len = end_len;
                }
            } else {
                timeout_count -= 1;
                sleep(Duration::from_millis(10))
            }
            if timeout_count <= 0 {
                anyhow::bail!("Not read ending.");
            }
        }
        // let s = String::from_utf8_lossy(&buf);
        // println!("S:{}", s);
        Ok(Vec::from(&buf[..len]))
    }
}
