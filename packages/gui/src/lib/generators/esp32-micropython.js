/**
 * Register the ESP32 MicroPython block-to-code generators.
 *
 * Opcode names remain unchanged so projects created before this module was
 * separated from the generic Blockly integration continue to load.
 * @param {object} ScratchBlocks - OpenBlock's Blockly instance
 */
const registerEsp32MicroPythonGenerators = ScratchBlocks => {
    /*****************************************************************************************************/

    //print-----------------------------------------------------------------------------
    //print in console 在控制台打印
    ScratchBlocks.Micropython['microPython_print_consolePrint'] = function (block) {
        var msg = ScratchBlocks.Micropython.valueToCode(block, 'TEXT', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || 'Hello World!';
        var code = `print(str(${msg}))#在控制台打印文本\n`;
        return code;
    };

    //init oled screen OLED初始化
    ScratchBlocks.Micropython['microPython_print_screenInit'] = function (block) {
        ScratchBlocks.Micropython.imports_["sh1106"] = "from txd import Oled";
        var scl = block.getFieldValue('SCL') || '18';
        var sda = block.getFieldValue('SDA') || '19';
        var rotate = block.getFieldValue('ROTATE') || '180';
        ScratchBlocks.Micropython.setups_[`init_sh1106`] = `init_sh1106 = Oled(scl = ${scl},sda = ${sda},rotate = ${rotate})#初始化屏幕接口`
        return ``;
    };
    //oled screen show 在OLED上显示文本
    ScratchBlocks.Micropython['microPython_print_screenPrint'] = function (block) {
        var x = ScratchBlocks.Micropython.valueToCode(block, 'X',
            ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || "0";
        var text = ScratchBlocks.Micropython.valueToCode(block, 'TEXT',
            ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || "'Hello world!'";
        var code = `init_sh1106.show(str(${text}),${x})#在屏幕上显示文本\n`;
        return code;
    };

    //画一条直线
    ScratchBlocks.Micropython['microPython_print_drawLine'] = function (block) {
        var x = ScratchBlocks.Micropython.valueToCode(block, 'X', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var y = ScratchBlocks.Micropython.valueToCode(block, 'Y', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var u = ScratchBlocks.Micropython.valueToCode(block, 'U', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '127';
        var v = ScratchBlocks.Micropython.valueToCode(block, 'V', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '63';
        var code = `init_sh1106.draw_line(x0=${x},y0=${y},x1=${u},y1=${v})\n`;
        return code;
    };

    //画矩形
    ScratchBlocks.Micropython['microPython_print_drawRectangle'] = function (block) {
        var x = ScratchBlocks.Micropython.valueToCode(block, 'X', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var y = ScratchBlocks.Micropython.valueToCode(block, 'Y', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var w = ScratchBlocks.Micropython.valueToCode(block, 'W', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '127';
        var h = ScratchBlocks.Micropython.valueToCode(block, 'H', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '63';
        var code = `init_sh1106.draw_rect(x=${x},y=${y},w=${w},h=${h})\n`;
        return code;
    };

    //画圆形
    ScratchBlocks.Micropython['microPython_print_drawCircle'] = function (block) {
        // 获取块中'X'参数的值，如果没有提供则默认为'0'
        var x = ScratchBlocks.Micropython.valueToCode(block, 'X', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '60';
        // 获取块中'Y'参数的值，如果没有提供则默认为'0'
        var y = ScratchBlocks.Micropython.valueToCode(block, 'Y', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '30';
        // 获取块中'R'参数的值（半径），如果没有提供则默认为'10'
        var r = ScratchBlocks.Micropython.valueToCode(block, 'R', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '10';
        // 并将参数转换为特定单位
        var code = `init_sh1106.draw_circle(x0=${x}, y0=${y}, r=int(${r}))\n`;
        // 返回生成的代码
        return code;
    };

    //oled screen clear //清空OLED屏幕
    ScratchBlocks.Micropython['microPython_print_screenClear'] = function (block) {
        var code = `init_sh1106.clear_all()\n`;
        return code;
    };

    //pin----------------------------------------------------------------------------
    //set digital output
    ScratchBlocks.Micropython['microPython_pin_setDigitalOutput'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '12';
        var level = block.getFieldValue('LEVEL') || 'Low';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = Pin(${pin}, Pin.OUT, value=0)`
        var code = `p${pin}.value(${level})\n`;
        return code;
    };

    //set pwm output
    ScratchBlocks.Micropython['microPython_pin_setPwmOutput'] = function (block) {
        ScratchBlocks.Micropython.imports_["PWM"] = "from machine import PWM";
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '5';
        var out = ScratchBlocks.Micropython.valueToCode(block, 'OUT', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '50';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = PWM(Pin(${pin}))`
        var code = `p${pin}.duty(${out})\n`;
        return code;
    };

    //set direction of Motor L298N
    ScratchBlocks.Micropython['microPython_pin_motor'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin1 = block.getFieldValue('PIN1') || '13';
        var pin2 = block.getFieldValue('PIN2') || '14';
        var direction = block.getFieldValue('DIRECTION') || '1';
        ScratchBlocks.Micropython.setups_[`p${pin1}`] = `p${pin1} = Pin(${pin1}, Pin.OUT, value=0)`
        ScratchBlocks.Micropython.setups_[`p${pin2}`] = `p${pin2} = Pin(${pin2}, Pin.OUT, value=0)`
        var code = ``;
        if (direction == '-1') {
            code = `p${pin1}.value(0)\n` + `p${pin2}.value(0)\n`;
        }
        else {
            code = `p${pin1}.value(${direction})\n` + `p${pin2}.value(1-${direction})\n`;
        }
        return code;
    };

    //read digital Pin
    ScratchBlocks.Micropython['microPython_pin_readDigitalPin'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '12';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = Pin(${pin}, Pin.IN, Pin.PULL_UP)`
        var code = `p${pin}.value()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //read ADC Pin
    ScratchBlocks.Micropython['microPython_pin_readADCPin'] = function (block) {
        ScratchBlocks.Micropython.imports_["ADC"] = "from machine import ADC";
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '35';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = ADC(Pin(${pin}, Pin.IN, Pin.PULL_UP))`
        var code = `p${pin}.read()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //IOT---------------------------------------------------------------------------
    //connect wifi
    ScratchBlocks.Micropython['microPython_IOT_connectWiFi'] = function (block) {
        ScratchBlocks.Micropython.imports_["network"] = "import network";
        var essid = ScratchBlocks.Micropython.valueToCode(block, 'ESSID', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || 'G';
        var password = ScratchBlocks.Micropython.valueToCode(block, 'PASSWORD', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || 'goodlife';
        ScratchBlocks.Micropython.setups_[`do_connect`] =
            `def do_connect():\n` +
            `   wlan = network.WLAN(network.STA_IF)\n` +
            `   wlan.active(True)\n` +
            `   if not wlan.isconnected():\n` +
            `       print('连接中...')\n` +
            `       wlan.connect(${essid}, ${password})\n` +
            `       while not wlan.isconnected():\n` +
            `           pass\n` +
            `   print('连接成功')\n`

        var code = `do_connect() #连接WiFi\n`;
        return code;
    };

    //disconnect wifi
    ScratchBlocks.Micropython['microPython_IOT_disconnectWiFi'] = function (block) {
        ScratchBlocks.Micropython.imports_["network"] = "import network";
        ScratchBlocks.Micropython.setups_[`dis_connect`] =
            `def disconnect_wifi():\n` +
            `   wlan = network.WLAN(network.STA_IF)\n` +
            `   if wlan.isconnected():\n` +
            `       wlan.disconnect()  #断开连接\n` +
            `       print("断开连接")\n` +
            `   wlan.active(False)\n`

        var code = `disconnect_wifi() #断开WiFi\n`;
        return code;
    };

    //connect mqtt
    ScratchBlocks.Micropython['microPython_IOT_connectMQTTServer'] = function (block) {
        ScratchBlocks.Micropython.imports_["MQTTClient"] = "from umqtt.simple import MQTTClient #导入mqtt库";
        ScratchBlocks.Micropython.imports_["random"] = "import random #导入随机函数库";
        var server = ScratchBlocks.Micropython.valueToCode(block, 'SERVER', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || 'broker.emqx.io';
        var port = ScratchBlocks.Micropython.valueToCode(block, 'PORT', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '1883';
        var id = 'f"NKLAB-{random.getrandbits(8)}"'
        var code = `client = MQTTClient(${id}, ${server}, ${port}) #设置MQTT服务器信息\n`
        code += `client.set_callback(mqtt_callback) #调用回调函数(请务必设置回调函数)\n`
        code += `client.connect()#连接服务器\n`
        return code;
    };

    //将数据发布到话题
    ScratchBlocks.Micropython['microPython_IOT_publishData'] = function (block) {
        var data = ScratchBlocks.Micropython.valueToCode(block, 'DATA', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL);
        var topic = ScratchBlocks.Micropython.valueToCode(block, 'TOPIC', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL);
        var code = `client.publish(${topic}, ${data})#将数据发布到话题\n`;
        return code;
    };

    //订阅话题
    ScratchBlocks.Micropython['microPython_IOT_subscribeTopic'] = function (block) {
        var topic = ScratchBlocks.Micropython.valueToCode(block, 'TOPIC', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL);
        var code = `client.subscribe(${topic}) #订阅话题\n`;
        return code;
    };

    //等待消息
    ScratchBlocks.Micropython['microPython_IOT_waitMsgFromTopic'] = function (block) {
        var code = `client.wait_msg() #等待来自订阅话题的消息\n`;
        return code;
    };

    //设置回调函数
    ScratchBlocks.Micropython['microPython_IOT_setCallback'] = function (block) {
        //如果后面没有连接积木块，就显示以下文字
        var topic = ScratchBlocks.Micropython.valueToCode(block, 'TOPIC', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || 'G';
        // 构建回调函数代码
        var code = `def mqtt_callback(topic, msg): # 当接收到MQTT话题的消息时，执行以下操作\n`;
        var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        if (!nextBlock) {
            code += `    pass\n`;
        }
        return code;
    };

    //subscribe data
    ScratchBlocks.Micropython['microPython_IOT_msg'] = function (block) {
        var code = `msg.decode()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };


    //sensor---------------------------------------------------------------------------
    //infrared
    ScratchBlocks.Micropython['microPython_sensor_infrared'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '0';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = Pin(${pin}, Pin.IN, Pin.PULL_UP)`
        var code = `p${pin}.value()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //distance
    ScratchBlocks.Micropython['microPython_sensor_distanceSensor'] = function (block) {
        ScratchBlocks.Micropython.imports_["Ultrasonic"] = "from txd import Ultrasonic";
        var trig = block.getFieldValue('TRIG') || '21';
        var echo = block.getFieldValue('ECHO') || '22';
        ScratchBlocks.Micropython.setups_[`Ultrasonic`] = `Ultrasonic_${trig}_${echo} = Ultrasonic(trig_pin = ${trig},echo_pin = ${echo})`
        var code = `Ultrasonic_${trig}_${echo}.distance()`
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //DHT
    ScratchBlocks.Micropython['microPython_sensor_DHTMEASURE'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        ScratchBlocks.Micropython.imports_["dht"] = "import dht";
        var pin = block.getFieldValue('PIN') || '23';
        var code = `p${pin} = dht.DHT11(Pin(${pin},Pin.IN,Pin.PULL_UP))\np${pin}.measure()\n`;
        return code;
    };

    ScratchBlocks.Micropython['microPython_sensor_DH'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        ScratchBlocks.Micropython.imports_["dht"] = "import dht";
        var pin = block.getFieldValue('PIN') || '23';
        var code = `p${pin}.humidity()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    ScratchBlocks.Micropython['microPython_sensor_DT'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        ScratchBlocks.Micropython.imports_["dht"] = "import dht";
        var pin = block.getFieldValue('PIN') || '23';
        var code = `p${pin}.temperature()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //BH1750 OK
    ScratchBlocks.Micropython['microPython_sensor_BH1750'] = function (block) {
        ScratchBlocks.Micropython.imports_["BH1750"] = "import BH1750";
        var scl = block.getFieldValue('SCL') || '18';
        var sda = block.getFieldValue('SDA') || '19';
        ScratchBlocks.Micropython.setups_[`bh1750`] = `Light_intensity_${scl}_{sda} = BH1750.bh1750(scl = ${scl},sda = ${sda})`
        var code = `Light_intensity.read_data()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //光敏电阻 绝对值
    ScratchBlocks.Micropython['microPython_sensor_Photoresistance'] = function (block) {
        ScratchBlocks.Micropython.imports_["ADC"] = "from machine import ADC";
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '35';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = ADC(Pin(${pin}, Pin.IN, Pin.PULL_UP))`
        var code = `p${pin}.read()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //光敏电阻 相对值
    ScratchBlocks.Micropython['microPython_sensor_PhotoresistanceRelative'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin ";
        ScratchBlocks.Micropython.imports_["ADC"] = "from machine import ADC";
        var pin = block.getFieldValue('PIN') || '35';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = ADC(Pin(${pin}, Pin.IN, Pin.PULL_UP))`
        var light = ScratchBlocks.Micropython.valueToCode(block, 'LIGHT', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '4095';
        var dark = ScratchBlocks.Micropython.valueToCode(block, 'DARK', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var code = `abs((p${pin}.read()-${light})/(${dark}-${light}))`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };

    //土壤湿度 相对
    ScratchBlocks.Micropython['microPython_sensor_soilMoistureSensor'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        ScratchBlocks.Micropython.imports_["ADC"] = "from machine import ADC";
        var pin = block.getFieldValue('PIN') || '14';
        var water = ScratchBlocks.Micropython.valueToCode(block, 'WATER', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '4095';
        var air = ScratchBlocks.Micropython.valueToCode(block, 'AIR', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = ADC(Pin(${pin}, Pin.IN, Pin.PULL_UP))`
        var code = `abs((p${pin}.read()-${air})/(${water}-${air}))`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];

    };

    //土壤湿度 绝对
    ScratchBlocks.Micropython['microPython_sensor_soilMoistureSensorAbsolute'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin ";
        ScratchBlocks.Micropython.imports_["ADC"] = "from machine import ADC";
        var pin = block.getFieldValue('PIN') || '14';
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = ADC(Pin(${pin}, Pin.IN, Pin.PULL_UP))`
        var code = `p${pin}.read()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];

    };

    //DCwaterPump OK
    ScratchBlocks.Micropython['microPython_other_dcWaterPump'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        var pin = block.getFieldValue('PIN') || '4';
        var station = block.getFieldValue('STATION') || 'Off';//对于积木块下拉选项，全部使用getFieldValue
        ScratchBlocks.Micropython.setups_[`p${pin}`] = `p${pin} = Pin(${pin},Pin.OPEN_DRAIN,value=${station})`
        var code = `p${pin}.value(${station})\n`;
        return code;
    };

    //RGBInit
    ScratchBlocks.Micropython['microPython_other_RGBInit'] = function (block) {
        ScratchBlocks.Micropython.imports_["RGBs"] = "from txd import RGBs";
        var pin = block.getFieldValue('PIN') || '13';
        var num = ScratchBlocks.Micropython.valueToCode(block, 'NUM', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '30';
        ScratchBlocks.Micropython.setups_[`init_RGBs`] = `init_RGBs = RGBs(${pin},${num})#初始化RGB灯`
        return ``;
    };

    //single RGB
    ScratchBlocks.Micropython['microPython_other_RGB'] = function (block) {
        var r = ScratchBlocks.Micropython.valueToCode(block, 'R', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '100';
        var g = ScratchBlocks.Micropython.valueToCode(block, 'G', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var b = ScratchBlocks.Micropython.valueToCode(block, 'B', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var code = `init_RGBs.set_color(index=0,r=${r},g=${g},b=${b})#设置单个灯的颜色\n`;
        return code;
    };

    //RGBS
    ScratchBlocks.Micropython['microPython_other_RGBs'] = function (block) {
        var r = ScratchBlocks.Micropython.valueToCode(block, 'R', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '100';
        var g = ScratchBlocks.Micropython.valueToCode(block, 'G', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var b = ScratchBlocks.Micropython.valueToCode(block, 'B', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var code = `init_RGBs.set_all_color(r=${r},g=${g},b=${b})#设置所有灯的颜色\n`;
        return code;
    };

    //RGB index
    ScratchBlocks.Micropython['microPython_other_RGBsIndex'] = function (block) {
        var index = ScratchBlocks.Micropython.valueToCode(block, 'INDEX', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '15';
        var r = ScratchBlocks.Micropython.valueToCode(block, 'R', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '100';
        var g = ScratchBlocks.Micropython.valueToCode(block, 'G', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';
        var b = ScratchBlocks.Micropython.valueToCode(block, 'B', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '0';

        var code = `init_RGBs.set_color(index=${index},r=${r},g=${g},b=${b})#设置单个灯的颜色\n`;
        return code;
    };

    //PCA9685 init
    ScratchBlocks.Micropython['microPython_other_PCA9685Init'] = function (block) {
        ScratchBlocks.Micropython.imports_["ServoMotor"] = "from txd import ServoMotor";
        var scl = block.getFieldValue('SCL') || '25';
        var sda = block.getFieldValue('SDA') || '26';
        ScratchBlocks.Micropython.setups_[`init_PCA9685`] = `init_PCA9685 = ServoMotor(scl = ${scl},sda = ${sda})`
        return ``;
    };

    //PCA9685 OK
    ScratchBlocks.Micropython['microPython_other_PCA9685SetAngle'] = function (block) {
        ScratchBlocks.Micropython.imports_["time"] = "from time import *";
        var channel = block.getFieldValue('CHANNEL') || 'L0';
        var degrees = ScratchBlocks.Micropython.valueToCode(block, 'DEGREES', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '90';
        var code = `init_PCA9685.set_angle(channel = ${channel},degrees = ${degrees})\nsleep(1.5)\n`;
        return code;
    };

    //buzzer ok
    ScratchBlocks.Micropython['microPython_other_buzzer'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        ScratchBlocks.Micropython.imports_["PWM"] = "from machine import PWM";
        var pin = block.getFieldValue('PIN') || '5';
        var duty = ScratchBlocks.Micropython.valueToCode(block, 'DUTY', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '80';
        var freq = ScratchBlocks.Micropython.valueToCode(block, 'FREQ', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || '600';
        var code = `buzzer${pin} = PWM(Pin(${pin}), freq=int(${freq}), duty=int(${duty}))#请勿将频率设置为0！\n`;
        return code;
    };

    //close buzzer ok
    ScratchBlocks.Micropython['microPython_other_closeBuzzer'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin";
        ScratchBlocks.Micropython.imports_["PWM"] = "from machine import PWM";
        var pin = block.getFieldValue('PIN') || '5';
        var code = `buzzer${pin} = PWM(Pin(${pin}), freq=2000, duty=0)#关闭蜂鸣器\n`;
        return code;
    };

    //----------------------------------------------------------视觉和语音
    //语音播报
    ScratchBlocks.Micropython['microPython_visionAndSpeech_broadcast'] = function (block) {
        ScratchBlocks.Micropython.imports_["Speech"] = "from Speech import Speaker#从Speech导入语音库";
        ScratchBlocks.Micropython.setups_["Speaker"] = "speaker = Speaker()#初始化语音对象";
        var content = ScratchBlocks.Micropython.valueToCode(block, 'CONTENT', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || "'ESP32 MicroPython'";
        var code = `speaker.speak(${content})#语音播报\n`;
        return code;
    };

    //初始化Sentry摄像头引脚、坐标格式
    ScratchBlocks.Micropython['microPython_visionAndSpeech_Sentryinit'] = function (block) {
        ScratchBlocks.Micropython.imports_["Pin"] = "from machine import Pin #从machine导入引脚库";
        ScratchBlocks.Micropython.imports_["I2C"] = "from machine import I2C #从machine导入硬件IIC库";
        ScratchBlocks.Micropython.imports_["Sentry"] = "from Sentry import * #从Sentry导入所有库";
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var scl = block.getFieldValue('SCL') || '12';
        var sda = block.getFieldValue('SDA') || '13';
        var address = block.getFieldValue('ADDRESS') || '0x60';
        var coordinate = block.getFieldValue('COORDINATE') || '1';
        ScratchBlocks.Micropython.setups_[`initSentry`] = `nklab_sentry = ${sentry}(${address})#实例化摄像头类`
        ScratchBlocks.Micropython.setups_[`initIIC`] = `init_iic_${scl}_${sda} = I2C(1, scl=Pin(${scl}), sda=Pin(${sda}), freq=115200)#初始化摄像头IIC(ID恒定为1)`
        ScratchBlocks.Micropython.setups_[`IIC_check`] = `address=init_iic_${scl}_${sda}.scan()\nprint("检测到IIC地址:", address) if address else print("没有检测到IIC设备，请检查接线")`
        ScratchBlocks.Micropython.setups_[`SentryBegin`] = `nklab_sentry.begin(init_iic_${scl}_${sda})#开启摄像头`
        ScratchBlocks.Micropython.setups_[`SentryCoordinate`] = `nklab_sentry.SeneorSetCoordinateType(${coordinate})#设置坐标格式`
        return ``;
    };

    //使能Sentry算法
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentryenableAlgorithm'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var enable = block.getFieldValue('ENABLE');
        var algorithm = block.getFieldValue('ALGORITHM');
        var code = `nklab_sentry.Vision${enable}(${sentry}_vision_e.${algorithm})#算法使能\n`
        return code;
    };

    //重置Sentry参数
    ScratchBlocks.Micropython['microPython_visionAndSpeech_Sentryreset'] = function (block) {
        var code = `nklab_sentry.SensorSetDefault() #重置Sentry摄像头参数\n`
        return code;
    };

    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentrymultiObjectRecognition'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var object = block.getFieldValue('OBJECT') || 'kAirplane';
        var code = `(nklab_sentry.GetValue(${sentry}_vision_e.kVision20Classes, sentry_obj_info_e.kLabel, 1) == class20_label_e.${object})`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentrycardRecognition'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var card = block.getFieldValue('CARD') || 'kCardForward';
        var code = `(nklab_sentry.GetValue(${sentry}_vision_e.kVisionCard, sentry_obj_info_e.kLabel, 1) == ${sentry}_card_label_e.${card})`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentrycolorBlocksRecognition'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var colorblocks = block.getFieldValue('COLORBLOCKS') || 'kColorBlack';
        var code = `(nklab_sentry.GetValue(${sentry}_vision_e.kVisionBlob, sentry_obj_info_e.kLabel, 1) == color_label_e.${colorblocks})`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentrycolorRecognition'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var color = block.getFieldValue('COLOR') || 'kColorBlack';
        var code = `(nklab_sentry.GetValue(${sentry}_vision_e.kVisionColor, sentry_obj_info_e.kLabel, 1) == color_label_e.${color})`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentryQRcodeDetectResults'] = function (block) {
        var code = `nklab_sentry.GetQrCodeValue()`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentryQRcodeDetectInfo'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var info = block.getFieldValue('INFO') || '1';
        var code = `nklab_sentry.GetValue(${sentry}_vision_e.kVisionQrCode, ${info}, 1)`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentrygetResults'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var algorithm = block.getFieldValue('ALGORITHM') || 'kVisionColor';
        var info = block.getFieldValue('INFO') || 'kXValue';
        var code = `nklab_sentry.GetValue(${sentry}_vision_e.${algorithm}, sentry_obj_info_e.${info}, 1)`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
    ScratchBlocks.Micropython['microPython_visionAndSpeech_SentrygetResultsNumber'] = function (block) {
        var sentry = block.getFieldValue('SENTRY') || 'sentry1';
        var algorithm = block.getFieldValue('ALGORITHM') || 'kVisionColor';
        var code = `nklab_sentry.GetValue(${sentry}_vision_e.${algorithm}, sentry_obj_info_e.kStatus)`;
        return [code, ScratchBlocks.Micropython.ORDER_ATOMIC];
    };
};

export default registerEsp32MicroPythonGenerators;
