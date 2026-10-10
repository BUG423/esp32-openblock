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

goog.provide('Blockly.Micropython.control');

goog.require('Blockly.Micropython');


Blockly.Micropython['control_wait'] = function (block) {
  Blockly.Micropython.imports_["time"] = "from time import *";

  var arg0 = Blockly.Micropython.valueToCode(block, 'DURATION',
    Blockly.Micropython.ORDER_FUNCTION_CALL);
  var code = "sleep(" + arg0 + ")\n";
  return code;
};

Blockly.Micropython['control_repeat'] = function (block) {
  var repeats = Blockly.Micropython.valueToCode(block, 'TIMES',
    Blockly.Micropython.ORDER_FUNCTION_CALL);
  var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Micropython.addLoopTrap(branch, block.id);

  var code = "for count in range(" + repeats + "):\n";
  if (branch) {
    code += branch;
  } else {
    code += Blockly.Micropython.INDENT + "pass\n";
  }
  return code;
};

Blockly.Micropython['control_forever'] = function (block) {
  var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Micropython.addLoopTrap(branch, block.id);

  if (block.getRootBlock().type === 'event_whenmicrobitbegin') {
    Blockly.Micropython.firstLoop = false;
  }

  var code = "while True:\n";
  code += branch;
  code += Blockly.Micropython.INDENT + "repeat()\n";
  return code;
};

Blockly.Micropython['control_if'] = function (block) {
  var argument = Blockly.Micropython.valueToCode(block, 'CONDITION',
    Blockly.Micropython.ORDER_NONE) || 'False';
  var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Micropython.addLoopTrap(branch, block.id);

  var code = "if " + argument + ":\n";
  if (branch) {
    code += branch;
  } else {
    code += Blockly.Micropython.INDENT + "pass\n";
  }
  return code;
};

Blockly.Micropython['control_if_else'] = function (block) {
  var argument = Blockly.Micropython.valueToCode(block, 'CONDITION',
    Blockly.Micropython.ORDER_NONE) || 'False';
  var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Micropython.addLoopTrap(branch, block.id);
  var branch2 = Blockly.Micropython.statementToCode(block, 'SUBSTACK2');
  branch2 = Blockly.Micropython.addLoopTrap(branch2, block.id);

  var code = "if " + argument + ":\n";
  if (branch) {
    code += branch;
  } else {
    code += Blockly.Micropython.INDENT + "pass\n";
  }
  code += "else:\n";
  if (branch2) {
    code += branch2;
  } else {
    code += Blockly.Micropython.INDENT + "pass\n";
  }
  return code;
};

Blockly.Micropython['control_wait_until'] = function (block) {
  var argument = Blockly.Micropython.valueToCode(block, 'CONDITION',
    Blockly.Micropython.ORDER_UNARY_POSTFIX) || 'False';
  var code = "while not " + argument + ":\n";
  code += Blockly.Micropython.INDENT + "repeat()\n";
  return code;
};

Blockly.Micropython['control_repeat_until'] = function (block) {
  var argument = Blockly.Micropython.valueToCode(block, 'CONDITION',
    Blockly.Micropython.ORDER_UNARY_POSTFIX) || 'False';

  var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
  branch = Blockly.Micropython.addLoopTrap(branch, block.id);

  var code = "while not " + argument + ":\n";
  code += branch;
  code += Blockly.Micropython.INDENT + "repeat()\n";
  return code;
};
