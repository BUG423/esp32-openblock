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

goog.provide('Blockly.Micropython.procedures');

goog.require('Blockly.Micropython');


Blockly.Micropython['procedures_definition'] = function (block) {
  var func = Blockly.Micropython.statementToCode(block, 'custom_block');

  // Delet first indent.
  func = func.slice(Blockly.Micropython.INDENT.length);
  var code = func + ':\n';

  var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  if (!nextBlock) {
    code += Blockly.Micropython.INDENT + "pass\n";
  } else {
    var variablesName = [];
    for (var x in Blockly.Micropython.variables_) {
      variablesName.push(Blockly.Micropython.variables_[x].slice(0, Blockly.Micropython.variables_[x].indexOf('=') - 1));
    }
    if (variablesName.length !== 0) {
      code += Blockly.Micropython.INDENT + "global " + variablesName.join(', ') + "\n";
    }

    code = Blockly.Micropython.scrub_(block, code);
  }

  Blockly.Micropython.customFunctions_[func] = code;
  return null;
};

Blockly.Micropython['procedures_call'] = function (block) {
  // Generators can not automatic handle indefinite parameters. We should get
  // block.inputList and handle
  var funcName = block.getProcCode();
  funcName = funcName.replace(/ /g, '_');
  funcName = funcName.replace(/%n/g, 'N');
  funcName = funcName.replace(/%s/g, 'S');
  funcName = funcName.replace(/%b/g, 'B');
  funcName = Blockly.Micropython.variableDB_.getName(funcName, Blockly.Procedures.NAME_TYPE);

  var argCode = [];
  for (var x = 0; x < block.inputList.length; x++) {
    if (block.inputList[x].type == Blockly.INPUT_VALUE) {
      if (block.inputList[x].connection.targetBlock()) {
        var targetBlock = block.inputList[x].connection.targetBlock();
        var targetCode = Blockly.Micropython.blockToCode(targetBlock);
        argCode.push(targetCode[0]);
      }
      // If empty mean's it's a boolean
      else {
        argCode.push('false');
      }
    }
  }

  var code = funcName + '(' + argCode.join(', ') + ');\n';
  return code;
};

Blockly.Micropython['procedures_prototype'] = function (block) {
  var funcName = block.getProcCode();
  var argName = block.displayNames_;
  var argCode = [];

  funcName = funcName.replace(/ /g, '_');
  for (var i = 0; i < argName.length; i++) {
    var ch = funcName.charAt(funcName.indexOf('%') + 1);
    var safeArgName = Blockly.Micropython.variableDB_.getName(argName[i], Blockly.Procedures.NAME_TYPE);
    Blockly.Micropython.customFunctionsArgName_[argName[i]] = safeArgName;

    if (ch === 'n') {
      funcName = funcName.replace('%n', 'N');
      argCode.push(safeArgName);
    }
    else if (ch === 's') {
      funcName = funcName.replace('%s', 'S');
      argCode.push(safeArgName);
    }
    else {
      funcName = funcName.replace('%b', 'B');
      argCode.push(safeArgName);
    }
  }
  funcName = Blockly.Micropython.variableDB_.getName(funcName, Blockly.Procedures.NAME_TYPE);

  var code = 'def ' + funcName + '(' + argCode.join(', ') + ')';
  return code;
};

Blockly.Micropython['argument_reporter_boolean'] = function (block) {
  var argName = block.getFieldValue('VALUE');
  var safeArgName = Blockly.Micropython.customFunctionsArgName_[argName];
  return [safeArgName, Blockly.Micropython.ORDER_ATOMIC];
};

Blockly.Micropython['argument_reporter_number'] = function (block) {
  var argName = block.getFieldValue('VALUE');
  var safeArgName = Blockly.Micropython.customFunctionsArgName_[argName];
  return [safeArgName, Blockly.Micropython.ORDER_ATOMIC];
};

Blockly.Micropython['argument_reporter_string'] = function (block) {
  var argName = block.getFieldValue('VALUE');
  var safeArgName = Blockly.Micropython.customFunctionsArgName_[argName];
  return [safeArgName, Blockly.Micropython.ORDER_ATOMIC];
};
