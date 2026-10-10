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

goog.provide('Blockly.Micropython.data');

goog.require('Blockly.Micropython');


Blockly.Micropython['data_variable'] = function (block) {
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('VARIABLE'),
    Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.Micropython.ORDER_ATOMIC];
};

Blockly.Micropython['data_setvariableto'] = function (block) {
  var arg0 = Blockly.Micropython.valueToCode(block, 'VALUE',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('VARIABLE'),
    Blockly.Variables.NAME_TYPE);

  // Arg is a number
  if (parseFloat(arg0.slice(1, -1)) == arg0.slice(1, -1)) {
    arg0 = parseFloat(arg0.slice(1, -1)).toString();
  }
  return varName + ' = ' + arg0 + '\n';
};

Blockly.Micropython['data_changevariableby'] = function (block) {
  var arg0 = Blockly.Micropython.valueToCode(block, 'VALUE',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('VARIABLE'),
    Blockly.Variables.NAME_TYPE);

  return varName + ' += ' + arg0 + '\n';
};

Blockly.Micropython['data_showvariable'] = function () {
  return '';
};

Blockly.Micropython['data_hidevariable'] = function () {
  return '';
};

Blockly.Micropython['data_listcontents'] = function (block) {
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.Micropython.ORDER_ATOMIC];
};

Blockly.Micropython['data_addtolist'] = function (block) {
  var item = Blockly.Micropython.valueToCode(block, 'ITEM',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return varName + '.append(' + item + ')\n';
};

Blockly.Micropython['data_deleteoflist'] = function (block) {
  var index = Blockly.Micropython.valueToCode(block, 'INDEX',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return 'del ' + varName + '[' + index + ' - 1]\n';
};

Blockly.Micropython['data_deletealloflist'] = function (block) {
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return 'del ' + varName + '[0:]\n';
};

Blockly.Micropython['data_insertatlist'] = function (block) {
  var item = Blockly.Micropython.valueToCode(block, 'ITEM',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var index = Blockly.Micropython.valueToCode(block, 'INDEX',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return varName + '.insert(' + index + ' - 1, ' + item + ')\n';
};

Blockly.Micropython['data_replaceitemoflist'] = function (block) {
  var item = Blockly.Micropython.valueToCode(block, 'ITEM',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var index = Blockly.Micropython.valueToCode(block, 'INDEX',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return varName + '[' + index + ' - 1] = ' + item + '\n';
};

Blockly.Micropython['data_itemoflist'] = function (block) {
  var index = Blockly.Micropython.valueToCode(block, 'INDEX',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return [varName + '[' + index + ' - 1]', Blockly.Micropython.ORDER_ATOMIC];
};

Blockly.Micropython['data_itemnumoflist'] = function (block) {
  var item = Blockly.Micropython.valueToCode(block, 'ITEM',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return [varName + '.index(' + item + ') + 1', Blockly.Micropython.ORDER_UNARY_SIGN];
};

Blockly.Micropython['data_lengthoflist'] = function (block) {
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return ['len(' + varName + ')', Blockly.Micropython.ORDER_ATOMIC];
};

Blockly.Micropython['data_listcontainsitem'] = function (block) {
  var item = Blockly.Micropython.valueToCode(block, 'ITEM',
    Blockly.Micropython.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Micropython.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return ['' + item + ' in ' + varName, Blockly.Micropython.ORDER_RELATIONAL];
};

Blockly.Micropython['data_showlist'] = function () {
  return '';
};

Blockly.Micropython['data_hidelist'] = function () {
  return '';
};

