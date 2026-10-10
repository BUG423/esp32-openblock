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

goog.provide('Blockly.Loongson.control');

goog.require('Blockly.Loongson');


Blockly.Loongson['control_wait'] = function (block) {
  Blockly.Loongson.imports_["time"] = "from time import *";

  var arg0 = Blockly.Loongson.valueToCode(block, 'DURATION',
    Blockly.Loongson.ORDER_FUNCTION_CALL);
  var code = "sleep(" + arg0 + ")\n";
  return code;
};

Blockly.Loongson['control_repeat'] = function (block) {
  var repeats = Blockly.Loongson.valueToCode(block, 'TIMES',
    Blockly.Loongson.ORDER_FUNCTION_CALL);
  var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Loongson.addLoopTrap(branch, block.id);

  var code = "for count in range(" + repeats + "):\n";
  if (branch) {
    code += branch;
  } else {
    code += Blockly.Loongson.INDENT + "pass\n";
  }
  return code;
};

Blockly.Loongson['control_forever'] = function (block) {
  var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Loongson.addLoopTrap(branch, block.id);

  if (block.getRootBlock().type === 'event_whenmicrobitbegin') {
    Blockly.Loongson.firstLoop = false;
  }

  var code = "while True:\n";
  code += branch;
  code += Blockly.Loongson.INDENT + "repeat()\n";
  return code;
};

Blockly.Loongson['control_if'] = function (block) {
  var argument = Blockly.Loongson.valueToCode(block, 'CONDITION',
    Blockly.Loongson.ORDER_NONE) || 'False';
  var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Loongson.addLoopTrap(branch, block.id);

  var code = "if " + argument + ":\n";
  if (branch) {
    code += branch;
  } else {
    code += Blockly.Loongson.INDENT + "pass\n";
  }
  return code;
};

Blockly.Loongson['control_if_else'] = function (block) {
  var argument = Blockly.Loongson.valueToCode(block, 'CONDITION',
    Blockly.Loongson.ORDER_NONE) || 'False';
  var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Loongson.addLoopTrap(branch, block.id);
  var branch2 = Blockly.Loongson.statementToCode(block, 'SUBSTACK2');
  branch2 = Blockly.Loongson.addLoopTrap(branch2, block.id);

  var code = "if " + argument + ":\n";
  if (branch) {
    code += branch;
  } else {
    code += Blockly.Loongson.INDENT + "pass\n";
  }
  code += "else:\n";
  if (branch2) {
    code += branch2;
  } else {
    code += Blockly.Loongson.INDENT + "pass\n";
  }
  return code;
};

Blockly.Loongson['control_wait_until'] = function (block) {
  var argument = Blockly.Loongson.valueToCode(block, 'CONDITION',
    Blockly.Loongson.ORDER_UNARY_POSTFIX) || 'False';
  var code = "while not " + argument + ":\n";
  code += Blockly.Loongson.INDENT + "repeat()\n";
  return code;
};

Blockly.Loongson['control_repeat_until'] = function (block) {
  var argument = Blockly.Loongson.valueToCode(block, 'CONDITION',
    Blockly.Loongson.ORDER_UNARY_POSTFIX) || 'False';

  var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Loongson.addLoopTrap(branch, block.id);

  var code = "while not " + argument + ":\n";
  code += branch;
  code += Blockly.Loongson.INDENT + "repeat()\n";
  return code;
};
