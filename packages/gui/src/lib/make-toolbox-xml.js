import createHardwareToolbox from './libraries/devices/baseToolbox/hardware';

const xmlOpen = '<xml style="display: none">';
const xmlClose = '</xml>';
const categorySeparator = '<sep gap="36"/>';
const softwareCategoryIds = new Set(['motion', 'looks', 'sound', 'sensing']);
const genericHardwareToolbox = createHardwareToolbox(null);

/**
 * Build a hardware-focused ScratchBlocks toolbox.
 * Board-specific categories come from the selected device's VM extension.
 *
 * @param {!boolean} isInitialSetup whether the workspace is still mounting
 * @param {?object} device selected device definition
 * @param {?boolean} isStage whether the stage is selected
 * @param {?string} targetId current editing target
 * @param {?Array.<object>} categoriesXML categories supplied by extensions
 * @param {?boolean} isRealtimeMode current program mode
 * @param {?string} costumeName retained for baseToolBoxXml API compatibility
 * @param {?string} backdropName retained for baseToolBoxXml API compatibility
 * @param {?string} soundName retained for baseToolBoxXml API compatibility
 * @returns {string} ScratchBlocks toolbox XML
 */
const makeToolboxXML = function (isInitialSetup, device = null, isStage = true, targetId, categoriesXML = [],
    isRealtimeMode = true,
    costumeName = '', backdropName = '', soundName = '') {
    const toolbox = [xmlOpen];
    const baseToolbox = device ? device.baseToolBoxXml : genericHardwareToolbox;

    toolbox.push(...baseToolbox(
        isInitialSetup,
        isInitialSetup || isStage,
        targetId,
        isRealtimeMode,
        costumeName,
        backdropName,
        soundName
    ));

    categoriesXML
        .filter(category => !softwareCategoryIds.has(category.id))
        .forEach(category => toolbox.push(categorySeparator, category.xml));

    toolbox.push(xmlClose);
    return toolbox.join('\n');
};

export default makeToolboxXML;
