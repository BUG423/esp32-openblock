use super::mpy_io::MpyIO;
use anyhow::Result;
use std::fmt::Write;
use std::{thread::sleep, time::Duration};

const USE_RAW_PASTE: bool = true;
#[allow(dead_code)]
pub trait MpyAgent: MpyIO {
    fn enter_raw_repl(&mut self, soft_reset: bool) -> Result<()> {
        self.reboot()?;

        const WILL_RAW_REPL: &[u8; 26] = b"raw REPL; CTRL-B to exit\r\n";

        self.write(b"\x01")?;

        if soft_reset {
            // 以包含
            if self.read_until(1, b"raw REPL; CTRL-B to exit\r\n>").is_ok() {
                self.write(b"\x04")?;
                self.read_until(1, b"soft reboot\r\n")?;
            } else {
                anyhow::bail!("Failed to into raw REPL mode");
            }
        }
        self.read_until(1, WILL_RAW_REPL)?;
        Ok(())
    }

    fn exit_raw_repl(&mut self) -> Result<()> {
        self.write(b"\x02")?;

        let buf = self.read_to_end()?;
        // 最后四个字符是 ">>> ", 说明已经进入REPL模式
        if buf.ends_with(b">>> ") {
            Ok(())
        } else {
            anyhow::bail!("Failed to into REPL mode");
        }
    }

    fn raw_paste_write(&mut self, code_bytes: &[u8]) -> Result<()> {
        //
        let data = self.read_exact(2)?;
        // litter end to u16
        let window_size = u16::from_le_bytes([data[0], data[1]]) as usize;
        let mut window_remain = window_size;

        let mut i = 0;
        while i < code_bytes.len() {
            while window_remain == 0 {
                //
                let data = self.read_exact(1)?;
                match data.as_slice() {
                    b"\x01" => {
                        window_remain += window_size;
                    }
                    b"\x04" => {
                        self.write(b"\x04")?;
                    }
                    _ => {
                        anyhow::bail!("unexpected read during raw paste: {:?}", data);
                    }
                }
            }

            let e = (i + window_remain).min(code_bytes.len());
            let n = self.write(&code_bytes[i..e])?;
            window_remain -= n;
            i += n;
        }

        self.write(b"\x04")?;
        // 确保成功接收到数据
        self.read_until(1, b"\x04")?;
        Ok(())
    }

    /// 上传代码
    fn exec_raw_no_follow(&mut self, code_bytes: &[u8]) -> Result<()> {
        if self.read_until(1, b">").is_ok() {
            // Raw repl Mode
            if USE_RAW_PASTE {
                self.write(b"\x05A\x01")?;

                let data = self.read_exact(2)?;
                match data.as_slice() {
                    b"R\x00" => {}
                    b"R\x01" => return self.raw_paste_write(code_bytes),
                    _ => {
                        // # Device doesn't support raw-paste, fall back to normal raw REPL.
                        self.read_until(1, b"w REPL; CTRL-B to exit\r\n>")?;
                    }
                }
                // # Don't try to use raw-paste mode again for this connection.
                // self.use_raw_paste = false;
            }
            for i in (0..code_bytes.len()).step_by(256) {
                let e = (i + 256).min(code_bytes.len());
                self.write_all(&code_bytes[i..e])?;
                sleep(Duration::from_millis(10))
            }
            self.write(b"\x04")?;

            let data = self.read_exact(2)?;
            if data != b"OK" {
                anyhow::bail!("could not exec command (response:{:?})", data);
            }
            Ok(())
        } else {
            anyhow::bail!("Not in Raw REPL.")
        }
    }
    /// 读取代码的输出
    fn follow(&mut self) -> Result<(Vec<u8>, Vec<u8>)> {
        let mut data = self.read_until(1, b"\x04")?;
        data.pop();

        let mut data_err = self.read_until(1, b"\x04")?;
        data_err.pop();

        Ok((data, data_err))
    }
    /// 执行字节代码并输出
    fn execute_bytes(&mut self, code: &[u8]) -> Result<(Vec<u8>, Vec<u8>)> {
        self.exec_raw_no_follow(code)?;
        self.follow()
    }
    /// 执行代码并输出
    fn execute(&mut self, code: &str) -> Result<(Vec<u8>, Vec<u8>)> {
        self.execute_bytes(code.as_bytes())
    }
    fn eval(&mut self, expression: &str, parse: bool, prelude: Option<&str>) -> Result<String> {
        let command = if parse {
            format!("print(repr({}))", expression)
        } else {
            format!("print({})", expression)
        };
        // import prelude code before command
        let command = if let Some(prelude) = prelude {
            format!("{}\r\n{}", prelude, command)
        } else {
            format!("import machine\r\n{}", command)
        };

        let (stdout, _stderr) = self.execute(&command)?;
        let ret = String::from_utf8_lossy(&stdout);
        if !_stderr.is_empty() {
            eprintln!("stderr:{}", String::from_utf8_lossy(&_stderr));
        }
        Ok(ret.trim().to_string())
    }

    fn reboot(&mut self) -> Result<()> {
        self.write(b"\r\x03\x03")?;
        Ok(())
    }
    // -------------- fs and other -----------------

    #[allow(dead_code)]
    fn get_time(&mut self) -> Result<u64> {
        const EXPRESSION: &str = "machine.RTC().datetime()\r\n";
        let ret = self.eval(EXPRESSION, false, None)?;
        let t = ret.split(", ");
        let mut t = t.skip(3);

        let time = 3600 * t.next().unwrap().parse::<u64>().unwrap()
            + 60 * t.next().unwrap().parse::<u64>().unwrap()
            + t.next().unwrap().parse::<u64>().unwrap();
        Ok(time)
    }

    fn fs_exists(&mut self, path: &str) -> Result<bool> {
        // os.path.exists("pyboard.py")
        let expression = format!("import os\nprint(os.stat('{}'))\n", path);
        let (_stdout, _stderr) = self.execute(&expression)?;
        Ok(_stderr.is_empty())
    }
    fn fs_ls(&mut self, path: &str) -> Result<String> {
        let expression = format!("import os\nfor f in os.ilistdir('{}'):\n print('{{:12}} {{}}{{}}'.format(f[3]if len(f)>3 else 0,f[0],'/'if f[1]&0x4000 else ''))", path);
        let (stdout, _stderr) = self.execute(&expression)?;
        let ret = String::from_utf8_lossy(&stdout);
        Ok(ret.to_string())
    }
    fn fs_writefile(&mut self, dest: &str, data: &[u8], chunk_size: Option<usize>) -> Result<()> {
        let chunk_size = chunk_size.unwrap_or(256);

        self.execute(&format!("f=open('{}','wb')\nw=f.write", dest))?;

        for chunk in data.chunks(chunk_size) {
            let mut expression = String::new();
            chunk.iter().fold(&mut expression, |acc, b| {
                write!(acc, "\\x{:02x}", *b).unwrap();
                acc
            });

            let expression = format!("w(b'{}')\n", expression);
            log::info!("write chunk: {}", expression);
            self.execute(&expression)?;
        }
        self.execute("f.close()")?;
        Ok(())
    }
    fn fs_mkdir(&mut self, path: &str) -> Result<()> {
        let expression = format!("import os\nos.mkdir('{}')", path);
        self.execute(&expression)?;
        Ok(())
    }
    fn fs_rmdir(&mut self, path: &str) -> Result<()> {
        let expression = format!("import os\nos.rmdir('{}')", path);
        self.execute(&expression)?;
        Ok(())
    }
    fn fs_rm(&mut self, path: &str) -> Result<()> {
        let expression = format!("import os\nos.remove('{}')", path);
        self.execute(&expression)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use crate::io::usb_serial::UsbSerial;

    use super::MpyAgent;

    #[test]
    fn test_write() {
        env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
        let baud_rate = 115200;

        let mut device = UsbSerial::new("/dev/cu.wchusbserial2130".to_string(), baud_rate);
        device.open().unwrap();
        device.enter_raw_repl(true).unwrap();

        let ls = device.fs_ls("/").unwrap();

        device
            .fs_writefile("test.py", "data中文测试".as_bytes(), None)
            .unwrap();

        println!("ls:{}", ls);
    }

    #[test]
    fn test_() {
        let a = "中文";
        println!("a:{:?}", a.as_bytes());
    }
}

// #[cfg(test)]
// mod tests {

//     use super::*;

//     #[test]
//     fn test_mpy_repl_mode() {
//         let ports = get_port_list();

//         let mut mpy_agent = MpyAgent::new(&ports[0], 115200);
//         mpy_agent.enter_raw_repl(true).unwrap();

//         mpy_agent.exit_raw_repl().unwrap();
//     }

//     #[test]
//     fn test_eval() {
//         let ports = get_port_list();

//         let mut mpy_agent = MpyAgent::new(&ports[0], 115200);
//         mpy_agent.enter_raw_repl(true).unwrap();

//         let expression = "machine.RTC().datetime()\r\n";
//         let time = mpy_agent
//             .eval(expression, false, Some("import machine"))
//             .unwrap();
//         println!("Time: {}", time);
//     }

//     #[test]
//     fn test_get_time() {
//         let ports = get_port_list();
//         let mut mpy_agent = MpyAgent::new(&ports[0], 115200);
//         mpy_agent.enter_raw_repl(true).unwrap();

//         let time = mpy_agent.get_time().unwrap();

//         print!("Time:{}", time);
//     }

//     #[test]
//     fn teset_fs_writefile() {
//         let ports = get_port_list();
//         let mut mpy_agent = MpyAgent::new(&ports[0], 115200);
//         mpy_agent.enter_raw_repl(true).unwrap();

//         let dest = "test.py";
//         let data = "print('Hello World!')\r\n";
//         mpy_agent.fs_writefile(dest, data, None).unwrap();
//     }
// }
