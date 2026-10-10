goog.provide('Blockly.Loongson.loongbian');

goog.require('Blockly.Loongson');

// console
Blockly.Loongson['loongson_print_consolePrint'] = function (block) {
  var msg = Blockly.Loongson.valueToCode(block, 'TEXT', Blockly.Loongson.ORDER_FUNCTION_CALL) || '';
  var code = "print(" + msg + ")\n";
  return code;
};


Blockly.Loongson['loongson_print_screenInit'] = function (block) {
  Blockly.Loongson.imports_["i2c"] = "from luma.core.interface.serial import i2c";
  Blockly.Loongson.imports_["ssd1306"] = "from luma.oled.device import ssd1306";
  Blockly.Loongson.imports_["Image"] = "from PIL import Image, ImageDraw";

  var no = Blockly.Loongson.valueToCode(block, 'NO',
    Blockly.Loongson.ORDER_FUNCTION_CALL) || '1';
  Blockly.Loongson.setups_[`device`] = `device = ssd1306(i2c(port=${no}, address=0x3C))\ndevice.clear()`
  var code = ``;
  return code;
};


Blockly.Loongson['loongson_print_screenPrint'] = function (block) {
  Blockly.Loongson.setups_[`image`] = `image = Image.new(device.mode, device.size)`
  Blockly.Loongson.setups_[`draw`] = `draw = ImageDraw.Draw(image)`

  var x = Blockly.Loongson.valueToCode(block, 'X',
    Blockly.Loongson.ORDER_FUNCTION_CALL) || "0";
  var y = Blockly.Loongson.valueToCode(block, 'Y',
    Blockly.Loongson.ORDER_FUNCTION_CALL) || "0";
  var text = Blockly.Loongson.valueToCode(block, 'TEXT',
    Blockly.Loongson.ORDER_FUNCTION_CALL) || "'Hello world!'";

  var code = `draw.text((${x}, ${y}), str(${text}), fill='white')\n`
  code = code + `device.display(image)\n`
  return code;
};


Blockly.Loongson['loongson_print_screenClear'] = function (block) {
  Blockly.Loongson.setups_[`image`] = `image = Image.new(device.mode, device.size)`
  Blockly.Loongson.setups_[`draw`] = `draw = ImageDraw.Draw(image)`
  var color = block.getFieldValue('COLOR') || 'black';

  var code = `draw.rectangle(device.bounding_box, fill=${color})\n`
  return code;
};


// sensor
Blockly.Loongson['loongson_sensor_infrared'] = function (block) {
  Blockly.Loongson.imports_["loongpio"] = "from loongpio import *";
  Blockly.Loongson.imports_["loongpio.pins"] = "from loongpio.pins import *";

  var pin = block.getFieldValue('PIN') || 'GPIO4';
  var level = Blockly.Loongson.valueToCode(block, 'LEVEL',
    Blockly.Loongson.ORDER_FUNCTION_CALL) || 'LOW';

  Blockly.Loongson.setups_[`_${pin}`] =
    `_${pin} = Button(${pin})`

  var code = `_${pin}.is_pressed`
  return [code, Blockly.Loongson.ORDER_ATOMIC];
};


Blockly.Loongson['loongson_sensor_distanceSensor'] = function (block) {
  Blockly.Loongson.imports_["loongpio"] = "from loongpio import *";
  Blockly.Loongson.imports_["loongpio.pins"] = "from loongpio.pins import *";
  var trigger = block.getFieldValue('TRIGGER') || 'GPIO3';
  var echo = block.getFieldValue('ECHO') || 'GPIO4';
  Blockly.Loongson.setups_[`_${trigger}_${echo}`] =
    `_${trigger}_${echo} = DistanceSensor(trigger=${trigger}, echo=${echo})`
  var code = `_${trigger}_${echo}.distance`
  return [code, Blockly.Loongson.ORDER_ATOMIC];
};


// sounds
Blockly.Loongson['loongson_sounds_buzzer'] = function (block) {
  Blockly.Loongson.imports_["loongpio"] = "from loongpio import *";
  Blockly.Loongson.imports_["loongpio.pins"] = "from loongpio.pins import *";
  var pin = block.getFieldValue('PIN') || 'PWM0';
  var note = Blockly.Loongson.valueToCode(block, 'NOTE',
    Blockly.Loongson.ORDER_FUNCTION_CALL) || 'C';
  Blockly.Loongson.setups_[`_${pin}`] = `_${pin} = TonalBuzzer(${pin})`

  var code = `_${pin}.play(${note})\n`
  return code;
};

// buzzerStop
Blockly.Loongson['loongson_sounds_buzzerStop'] = function (block) {
  Blockly.Loongson.imports_["loongpio"] = "from loongpio import *";
  Blockly.Loongson.imports_["loongpio.pins"] = "from loongpio.pins import *";
  var pin = block.getFieldValue('PIN') || 'PWM0';
  Blockly.Loongson.setups_[`_${pin}`] = `_${pin} = TonalBuzzer(${pin})`
  var code = `_${pin}.stop()\n`
  return code;
};




