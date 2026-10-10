use anyhow::Result;
use mpy_agent::MpyAgent;

pub mod mpy_agent;
pub mod mpy_io;

pub trait MpyControl: MpyAgent {
    /// 读取应用输出任务开始
    fn read_task_start(&mut self) -> Result<()>;
    /// 读取应用输出任务取消
    #[allow(dead_code)]
    fn read_task_abort(&mut self) -> Result<()>;
    /// 连接到设备
    fn connect(&mut self) -> Result<()>;
    fn task_abort(&mut self) -> Result<()> {
        self.reboot()
    }

    ///  unload and start read task;
    #[allow(dead_code)]
    fn upload_raw(&mut self, code: &[u8]) -> Result<()> {
        self.exec_raw_no_follow(code)?;
        self.read_task_start()?;
        Ok(())
    }

    fn upload_and_save(&mut self, code: &[u8]) -> Result<()> {
        // 1 写入到设备文件 main.py
        self.fs_writefile("main.py", &code, None)?;
        // 2 执行代码
        self.exec_raw_no_follow(code)?;
        // 3 启动读取任务
        self.read_task_start()?;

        // self.exec_raw_no_follow(code)?;
        Ok(())
    }
}
