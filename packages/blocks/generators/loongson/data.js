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

goog.provide('Blockly.Loongson.data');

goog.require('Blockly.Loongson');


Blockly.Loongson['data_variable'] = function (block) {
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('VARIABLE'),
    Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.Loongson.ORDER_ATOMIC];
};

Blockly.Loongson['data_setvariableto'] = function (block) {
  var arg0 = Blockly.Loongson.valueToCode(block, 'VALUE',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('VARIABLE'),
    Blockly.Variables.NAME_TYPE);

  // Arg is a number
  if (parseFloat(arg0.slice(1, -1)) == arg0.slice(1, -1)) {
    arg0 = parseFloat(arg0.slice(1, -1)).toString();
  }
  return varName + ' = ' + arg0 + '\n';
};

Blockly.Loongson['data_changevariableby'] = function (block) {
  var arg0 = Blockly.Loongson.valueToCode(block, 'VALUE',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('VARIABLE'),
    Blockly.Variables.NAME_TYPE);

  return varName + ' += ' + arg0 + '\n';
};

Blockly.Loongson['data_showvariable'] = function () {
  return '';
};

Blockly.Loongson['data_hidevariable'] = function () {
  return '';
};

Blockly.Loongson['data_listcontents'] = function (block) {
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return [varName, Blockly.Loongson.ORDER_ATOMIC];
};

Blockly.Loongson['data_addtolist'] = function (block) {
  var item = Blockly.Loongson.valueToCode(block, 'ITEM',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return varName + '.append(' + item + ')\n';
};

Blockly.Loongson['data_deleteoflist'] = function (block) {
  var index = Blockly.Loongson.valueToCode(block, 'INDEX',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return 'del ' + varName + '[' + index + ' - 1]\n';
};

Blockly.Loongson['data_deletealloflist'] = function (block) {
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return 'del ' + varName + '[0:]\n';
};

Blockly.Loongson['data_insertatlist'] = function (block) {
  var item = Blockly.Loongson.valueToCode(block, 'ITEM',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var index = Blockly.Loongson.valueToCode(block, 'INDEX',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return varName + '.insert(' + index + ' - 1, ' + item + ')\n';
};

Blockly.Loongson['data_replaceitemoflist'] = function (block) {
  var item = Blockly.Loongson.valueToCode(block, 'ITEM',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var index = Blockly.Loongson.valueToCode(block, 'INDEX',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);

  return varName + '[' + index + ' - 1] = ' + item + '\n';
};

Blockly.Loongson['data_itemoflist'] = function (block) {
  var index = Blockly.Loongson.valueToCode(block, 'INDEX',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return [varName + '[' + index + ' - 1]', Blockly.Loongson.ORDER_ATOMIC];
};

Blockly.Loongson['data_itemnumoflist'] = function (block) {
  var item = Blockly.Loongson.valueToCode(block, 'ITEM',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return [varName + '.index(' + item + ') + 1', Blockly.Loongson.ORDER_UNARY_SIGN];
};

Blockly.Loongson['data_lengthoflist'] = function (block) {
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return ['len(' + varName + ')', Blockly.Loongson.ORDER_ATOMIC];
};

Blockly.Loongson['data_listcontainsitem'] = function (block) {
  var item = Blockly.Loongson.valueToCode(block, 'ITEM',
    Blockly.Loongson.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Loongson.variableDB_.getName(block.getFieldValue('LIST'),
    Blockly.Variables.NAME_TYPE);
  return ['' + item + ' in ' + varName, Blockly.Loongson.ORDER_RELATIONAL];
};

Blockly.Loongson['data_showlist'] = function () {
  return '';
};

Blockly.Loongson['data_hidelist'] = function () {
  return '';
};

