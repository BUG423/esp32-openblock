# 导入所需的库
import machine
import time

print("Hello, MicroPython!")  # 打印一行文字

# 定义 LED 灯连接的引脚（以 PyBoard 为例，使用板上的 LED）
led_pin = machine.Pin("LED", machine.Pin.OUT)


# 定义一个函数来控制 LED 灯的开关
def blink_led(led, delay):
    led.on()  # 打开 LED
    time.sleep(delay)  # 等待
    led.off()  # 关闭 LED
    time.sleep(delay)  # 等待


# 主循环
while True:
    blink_led(led_pin, 1)  # 调用函数，让 LED 闪烁，每次亮灭各延迟 1 秒
