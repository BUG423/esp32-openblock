/**
 * Visual Blocks Language
 *
 * Copyright 2021 openblock.cc.
 * https://github.com/openblockcc/openblock-blocks
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

goog.provide('Blockly.Micropython.event');

goog.require('Blockly.Micropython');


Blockly.Micropython['event_whentxdboardbegin'] = function (block) {
  var code = "";
  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (!nextBlock) {
    code += "pass # 开始编程 \n";
  }
  return code;
};

// Blockly.Micropython['microPython_IOT_setCallback'] = function (block) {
//   //如果后面没有连接积木块，就显示以下文字
//   var topic = ScratchBlocks.Micropython.valueToCode(block, 'TEXT', ScratchBlocks.Micropython.ORDER_FUNCTION_CALL) || 'G';
//   // 构建回调函数代码
//   var code = `def on_message(${topic}, msg): # 当接收到MQTT话题的消息\n`;
//   var code = "def on_message(${topic},msg):#当接收到MQTT话题的消息\n";
//   var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
//   if (!nextBlock) {
//     code += "    pass\n";
//   }
//   return code;
// };



