import 'openblock-blocks/arduino_compressed';
import 'openblock-blocks/python_compressed';
// import 'openblock-blocks/loongson_compressed';
import 'openblock-blocks/micropython_compressed';
// MARK import loongson-blocks

import { DeviceType } from './device';
//FIXME 这个地方说明使用的Blocky.Loongson
const getGeneratorNameFromDeviceType = deviceType => {
    if (deviceType === DeviceType.arduino) {
        return 'Arduino';
    } else if (deviceType === DeviceType.python ||
        deviceType === DeviceType.microbit) {
        return 'Python';
    } else if (deviceType == DeviceType.loongson){
        return 'Loongson'
    } else if (deviceType === DeviceType.huawei){
        return 'Loongson' // TEST
        // return 'Huawei';
    } else if (deviceType === DeviceType.microPython){
        return 'Micropython'; // 新建一个代码生成器
        // return 'Huawei';
    }
    // return 'Python'; // MARK 后期根据需求更改
    return 'null';
};

export {
    getGeneratorNameFromDeviceType
};
