import 'openblock-blocks/arduino_compressed';
import 'openblock-blocks/python_compressed';
import 'openblock-blocks/loongson_compressed';
import 'openblock-blocks/micropython_compressed';

import { DeviceType } from './device';

const getGeneratorNameFromDeviceType = deviceType => {
    if (deviceType === DeviceType.arduino) {
        return 'Arduino';
    } else if (deviceType === DeviceType.python ||
        deviceType === DeviceType.microbit) {
        return 'Python';
    } else if (deviceType === DeviceType.loongson ||
        deviceType === DeviceType.huawei) {
        return 'Loongson';
    } else if (deviceType === DeviceType.microPython) {
        return 'Micropython';
    }
    return 'null';
};

export {
    getGeneratorNameFromDeviceType
};
