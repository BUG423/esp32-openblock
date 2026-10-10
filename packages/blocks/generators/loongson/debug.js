goog.provide('Blockly.Loongson.debug');

goog.require('Blockly.Loongson');

// debug
Blockly.Loongson['loongson_debug_try'] = function (block) {
    var code = `try:\n`
    var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
    console.log(branch)
    branch = Blockly.Loongson.addLoopTrap(branch, block.id);
    if (branch) {
        code += branch;
    } else {
        code += Blockly.Loongson.INDENT + "pass\n";
    }
    return code;

};
Blockly.Loongson['loongson_debug_except'] = function (block) {
    var code = `except:\n`
    var branch = Blockly.Loongson.statementToCode(block, 'SUBSTACK');
    branch = Blockly.Loongson.addLoopTrap(branch, block.id);
    if (branch) {
        code += branch;
    }
    else {
        code += Blockly.Loongson.INDENT + "pass\n";
    }
    return code;
};