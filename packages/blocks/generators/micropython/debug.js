goog.provide('Blockly.Micropython.debug');

goog.require('Blockly.Micropython');

// debug
Blockly.Micropython['loongson_debug_try'] = function (block) {
    var code = `try:\n`
    var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
    console.log(branch)
    branch = Blockly.Micropython.addLoopTrap(branch, block.id);
    if (branch) {
        code += branch;
    } else {
        code += Blockly.Micropython.INDENT + "pass\n";
    }
    return code;

};
Blockly.Micropython['loongson_debug_except'] = function (block) {
    var code = `except:\n`
    var branch = Blockly.Micropython.statementToCode(block, 'SUBSTACK');
    branch = Blockly.Micropython.addLoopTrap(branch, block.id);
    if (branch) {
        code += branch;
    }
    else {
        code += Blockly.Micropython.INDENT + "pass\n";
    }
    return code;
};