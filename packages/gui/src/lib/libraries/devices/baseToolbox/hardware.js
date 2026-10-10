const categorySeparator = '<sep gap="36"/>';
const blockSeparator = '<sep gap="36"/>';

const events = startBlockType => `
    <category name="%{BKY_CATEGORY_EVENTS}" id="events" colour="#FFD500" secondaryColour="#CC9900">
        <block type="${startBlockType}"/>
        ${categorySeparator}
    </category>
`;

const control = `
    <category name="%{BKY_CATEGORY_CONTROL}" id="control" colour="#FFAB19" secondaryColour="#CF8B17">
        <block type="control_wait">
            <value name="DURATION">
                <shadow type="math_positive_number"><field name="NUM">1</field></shadow>
            </value>
        </block>
        ${blockSeparator}
        <block type="control_repeat">
            <value name="TIMES">
                <shadow type="math_whole_number"><field name="NUM">10</field></shadow>
            </value>
        </block>
        <block id="forever" type="control_forever"/>
        ${blockSeparator}
        <block type="control_if"/>
        <block type="control_if_else"/>
        <block id="wait_until" type="control_wait_until"/>
        <block id="repeat_until" type="control_repeat_until"/>
        ${blockSeparator}
        <block type="control_stop"/>
        ${categorySeparator}
    </category>
`;

const operators = `
    <category name="%{BKY_CATEGORY_OPERATORS}" id="operators" colour="#40BF4A" secondaryColour="#389438">
        <block type="operator_add">
            <value name="NUM1"><shadow type="math_number"><field name="NUM"/></shadow></value>
            <value name="NUM2"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        <block type="operator_subtract">
            <value name="NUM1"><shadow type="math_number"><field name="NUM"/></shadow></value>
            <value name="NUM2"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        <block type="operator_multiply">
            <value name="NUM1"><shadow type="math_number"><field name="NUM"/></shadow></value>
            <value name="NUM2"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        <block type="operator_divide">
            <value name="NUM1"><shadow type="math_number"><field name="NUM"/></shadow></value>
            <value name="NUM2"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        ${blockSeparator}
        <block type="operator_random">
            <value name="FROM"><shadow type="math_number"><field name="NUM">1</field></shadow></value>
            <value name="TO"><shadow type="math_number"><field name="NUM">10</field></shadow></value>
        </block>
        ${blockSeparator}
        <block type="operator_gt">
            <value name="OPERAND1"><shadow type="text"><field name="TEXT"/></shadow></value>
            <value name="OPERAND2"><shadow type="text"><field name="TEXT">50</field></shadow></value>
        </block>
        <block type="operator_lt">
            <value name="OPERAND1"><shadow type="text"><field name="TEXT"/></shadow></value>
            <value name="OPERAND2"><shadow type="text"><field name="TEXT">50</field></shadow></value>
        </block>
        <block type="operator_equals">
            <value name="OPERAND1"><shadow type="text"><field name="TEXT"/></shadow></value>
            <value name="OPERAND2"><shadow type="text"><field name="TEXT">50</field></shadow></value>
        </block>
        ${blockSeparator}
        <block type="operator_and"/>
        <block type="operator_or"/>
        <block type="operator_not"/>
        ${blockSeparator}
        <block type="operator_join">
            <value name="STRING1"><shadow type="text"><field name="TEXT">apple</field></shadow></value>
            <value name="STRING2"><shadow type="text"><field name="TEXT">banana</field></shadow></value>
        </block>
        <block type="operator_letter_of">
            <value name="LETTER"><shadow type="math_whole_number"><field name="NUM">1</field></shadow></value>
            <value name="STRING"><shadow type="text"><field name="TEXT">apple</field></shadow></value>
        </block>
        <block type="operator_length">
            <value name="STRING"><shadow type="text"><field name="TEXT">apple</field></shadow></value>
        </block>
        <block id="operator_contains" type="operator_contains">
            <value name="STRING1"><shadow type="text"><field name="TEXT">apple</field></shadow></value>
            <value name="STRING2"><shadow type="text"><field name="TEXT">a</field></shadow></value>
        </block>
        ${blockSeparator}
        <block type="operator_mod">
            <value name="NUM1"><shadow type="math_number"><field name="NUM"/></shadow></value>
            <value name="NUM2"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        <block type="operator_round">
            <value name="NUM"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        <block type="operator_mathop">
            <value name="NUM"><shadow type="math_number"><field name="NUM"/></shadow></value>
        </block>
        ${categorySeparator}
    </category>
`;

const variables = `
    <category
        name="%{BKY_CATEGORY_VARIABLES}"
        id="variables"
        colour="#FF8C1A"
        secondaryColour="#DB6E00"
        custom="VARIABLE">
    </category>
`;

const myBlocks = `
    <category
        name="%{BKY_CATEGORY_MYBLOCKS}"
        id="myBlocks"
        colour="#FF6680"
        secondaryColour="#FF4D6A"
        custom="PROCEDURE">
    </category>
`;

/**
 * Create the shared hardware-programming toolbox used by every board.
 * Device-specific GPIO and sensor categories are supplied by the VM extension.
 *
 * @param {?string} uploadStartBlock block used as the program entry in upload mode
 * @returns {Function} a baseToolBoxXml-compatible factory
 */
const createHardwareToolbox = uploadStartBlock => (
    isInitialSetup,
    isStage,
    targetId,
    isRealtimeMode
) => {
    const startBlockType = isRealtimeMode ? 'event_whenflagclicked' : uploadStartBlock;
    const toolbox = [];

    if (startBlockType) toolbox.push(events(startBlockType), categorySeparator);
    toolbox.push(
        control,
        categorySeparator,
        operators,
        categorySeparator,
        variables,
        categorySeparator,
        myBlocks
    );
    return toolbox;
};

export default createHardwareToolbox;
