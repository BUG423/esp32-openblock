import keyMirror from 'keymirror';

/**
 * Names for device programming framework types.
 * @enum {string}
 */
const DeviceType = keyMirror({
    /**
     * Arduino programming framework
     */
    arduino: null,

    /**
     * Python programming framework
     * Standerd Python
     */
    python: null,

    /**
     * MicroPython programming framework
     */
    microPython: null,

    /**
     * Microbit programming framework
     * Upload tools, etc. are different from standard MicroPython
     */
    microbit: null,


    /**
     * Loongson programming framework
     * Upload tools, etc. are different from standard MicroPython
     */
    loongson: null, // openblock-gui/src/lib/libraries/devices/index.jsx


    /** @       private */
    huawei: null,

});

const getLanguageFromDeviceType = deviceType => {
    // MARK DeviceType 对应 前端编辑器识别的代码类型
    if (deviceType === DeviceType.arduino) {
        return 'cpp';
    } else if (deviceType === DeviceType.microPython
        || deviceType === DeviceType.microbit
        || deviceType === DeviceType.loongson
        || deviceType === DeviceType.huawei
        || deviceType === DeviceType.microPython) {
        return 'python';
    }
    return 'text';
};

export { getLanguageFromDeviceType, DeviceType };
