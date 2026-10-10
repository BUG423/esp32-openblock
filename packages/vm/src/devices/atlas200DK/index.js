const formatMessage = require('format-message');

const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

const Atlas200DKPeripheral = require('../common/loongson-peripheral');

const DIVECE_OPT = {
    type: 'huawei'  //  告诉 openblock-link 使用哪种编译器和烧写软件来接收处理上传请求。
};
const PNPID_LIST = [
    '4.19.90+'
]
const SERIAL_CONFIG = {} // 兼容性

const Pins = {
    GPIO1: 'GPIO1',
    GPIO2: 'GPIO2',
    GPIO3: 'GPIO3',
    GPIO4: 'GPIO4',
    GPIO5: 'GPIO5',
    GPIO6: 'GPIO6',
    GPIO7: 'GPIO7',
    GPIO8: 'GPIO8',
    GPIO9: 'GPIO9',
    GPIO10: 'GPIO10',
    GPIO11: 'GPIO11',
    GPIO12: 'GPIO12',
    GPIO13: 'GPIO13',
    GPIO37: 'GPIO37',
    GPIO38: 'GPIO38',
    GPIO40: 'GPIO40',
    GPIO41: 'GPIO41',
    GPIO56: 'GPIO56',
    GPIO57: 'GPIO57',
    GPIO58: 'GPIO58',
    GPIO59: 'GPIO59',
    GPIO60: 'GPIO60',
    PWM0: 'PWM0',
    PWM1: 'PWM1',
    PWM2: 'PWM2',
    PWM3: 'PWM3',
    IIC1_SDA: 'IIC1_SDA',
    IIC1_SCL: 'IIC1_SCL',
    IIC0_SDA: 'IIC0_SDA',
    IIC0_SCL: 'IIC0_SCL',
    SPI_SDO: 'SPI_SDO',
    SPI_SDI: 'SPI_SDI',
    SPI_SCK: 'SPI_SCK',
    SPI_CSN1: 'SPI_CSN1',
    SPI_CSN2: 'SPI_CSN2',
    UART3_TXD: 'UART3_TXD',
    UART3_RXD: 'UART3_RXD',
    UART4_TXD: 'UART4_TXD',
    UART4_RXD: 'UART4_RXD',
    UART5_TXD: 'UART5_TXD',
    UART5_RXD: 'UART5_RXD',
    RS232_TXD: 'RS232_TXD',
    RS232_RXD: 'RS232_RXD'
};
const Level = {
    High: '1',
    Low: '0'
};
const Direction = {
    Forward: '1',
    Backward: '0',
    Stop: '-1'
};

class Atlas200DK extends Atlas200DKPeripheral {
    /**
     * Construct a Loongbian communication object.
     * @param {Runtime} runtime - the OpenBlock runtime
     * @param {string} deviceId - the id of the deivce
     * @param {string} originalDeviceId - the original id of the peripheral, like xxx_arduinoUno
     */
    constructor(runtime, deviceId, originalDeviceId) {
        super(runtime, deviceId, originalDeviceId, PNPID_LIST, SERIAL_CONFIG, DIVECE_OPT);
    }
}

class OpenBlockAtlas200DKDevice {
    static get DEVICE_ID() {
        return "atlas200DK";
    }
    constructor(runtime) {
        /**
         * The OpenBlock runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;

        this._peripheral = new Atlas200DK(this.runtime, OpenBlockAtlas200DKDevice.DEVICE_ID);
    }

    get PINS_MENU() {
        return [
            {
                text: 'GPIO1',
                value: Pins.GPIO1
            },
            {
                text: 'GPIO2',
                value: Pins.GPIO2
            },
            {
                text: 'GPIO3',
                value: Pins.GPIO3
            },
            {
                text: 'GPIO4',
                value: Pins.GPIO4
            },
            {
                text: 'GPIO5',
                value: Pins.GPIO5
            },
            {
                text: 'GPIO6',
                value: Pins.GPIO6
            },
            {
                text: 'GPIO7',
                value: Pins.GPIO7
            },
            {
                text: 'GPIO8',
                value: Pins.GPIO8
            },
            {
                text: 'GPIO9',
                value: Pins.GPIO9
            },
            {
                text: 'GPIO10',
                value: Pins.GPIO10
            },
            {
                text: 'GPIO11',
                value: Pins.GPIO11
            },
            {
                text: 'GPIO12',
                value: Pins.GPIO12
            },
            {
                text: 'GPIO13',
                value: Pins.GPIO13
            },
            {
                text: 'GPIO37',
                value: Pins.GPIO37
            },
            {
                text: 'GPIO38',
                value: Pins.GPIO38
            },
            {
                text: 'GPIO40',
                value: Pins.GPIO40
            },
            {
                text: 'GPIO41',
                value: Pins.GPIO41
            },
            {
                text: 'GPIO56',
                value: Pins.GPIO56
            },
            {
                text: 'GPIO57',
                value: Pins.GPIO57
            },
            {
                text: 'GPIO58',
                value: Pins.GPIO58
            },
            {
                text: 'GPIO59',
                value: Pins.GPIO59
            },
            {
                text: 'GPIO60',
                value: Pins.GPIO60
            }
        ];
    }

    get LEVEL_MENU() {
        return [
            {
                text: formatMessage({
                    id: 'loongbian.levelMenu.high',
                    default: 'high',
                    description: 'label for high level'
                }),
                value: Level.High
            },
            {
                text: formatMessage({
                    id: 'loongbian.levelMenu.low',
                    default: 'low',
                    description: 'label for low level'
                }),
                value: Level.Low
            }
        ];
    }

    get PWMS_MENU() {
        return [
            {
                text: 'PWM0',
                value: Pins.PWM0
            },
            {
                text: 'PWM1',
                value: Pins.PWM1
            },
            {
                text: 'PWM2',
                value: Pins.PWM2
            },
            {
                text: 'PWM3',
                value: Pins.PWM3
            }
        ];
    }

    get DIRECTION_MENU() {
        return [
            {
                text: 'Forward',
                value: Direction.Forward
            },
            {
                text: 'Backward',
                value: Direction.Backward
            },
            {
                text: 'Stop',
                value: Direction.Stop
            }
        ];
    }

    getInfo() {
        return [{
            id: 'pin',
            name: formatMessage({
                id: 'loongbian.category.pins', // pins
                default: 'Pins',
                description: 'The name of the loongbian device pin category'
            }),
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#3373CC',

            blocks: [
                // loongson_pins_setDigitalOutput
                {
                    opcode: 'setDigitalOutput',
                    text: formatMessage({
                        id: 'loongbian.pins.setDigitalOutput',
                        default: 'set digital pin [PIN] out [LEVEL]',
                        description: 'Loongbian set digital pin out'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.P0
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'level',
                            defaultValue: Level.High
                        }
                    }
                },
                {
                    opcode: 'setPwmOutput',
                    text: formatMessage({
                        id: 'loongbian.pins.setPwmOutput',
                        default: 'set pwm pin [PIN] out [OUT]',
                        description: 'loongbian set pwm pin out'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pwmPins',
                            defaultValue: Pins.PWM0
                        },
                        OUT: {
                            type: ArgumentType.OTO100_NUMBER,
                            defaultValue: '50'
                        }
                    }
                },
                {
                    opcode: 'waitButtonPressed',
                    text: formatMessage({
                        id: 'loongbian.pins.waitButtonPressed',
                        default: 'wait button [PIN] pressed, [LEVEL] is valid',
                        description: 'loongson waitButtonPressed'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO5
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'level',
                            defaultValue: Level.High
                        }
                    }
                },

                '---',
                {
                    opcode: 'readDigitalPin',
                    text: formatMessage({
                        id: 'loongbian.pins.readDigitalPin',
                        default: 'read digital pin [PIN]',
                        description: 'microbit read digital pin'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO1
                        }
                    }
                },
                {
                    opcode: 'buttonPressed',
                    text: formatMessage({
                        id: 'loongbian.pins.buttonPressed',
                        default: 'pin [PIN] is pressed [LEVEL] is valid',
                        description: 'microbit pin is pressed'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO5
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'level',
                            defaultValue: Level.High
                        }
                    }
                },
                {
                    opcode: 'motor',
                    text: formatMessage({
                        id: 'loongbian.pins.motor',
                        default: 'pin [PIN1] and pin [PIN2] control direction [DIRECTION]',
                        description: 'microbit pin '
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN1: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO5
                        },
                        PIN2: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO6
                        },
                        DIRECTION: {
                            type: ArgumentType.NUMBER,
                            menu: 'direction',
                            defaultValue: Direction.Forward
                        }
                    }
                }
            ],

            menus: {
                pins: {
                    items: this.PINS_MENU
                },
                level: {
                    acceptReporters: true,
                    items: this.LEVEL_MENU
                },
                pwmPins: {
                    items: this.PWMS_MENU
                },
                direction: {
                    items: this.DIRECTION_MENU
                }
            }

        },
        {
            id: 'print',
            name: formatMessage({
                id: 'loongbian.category.print',
                default: 'Print',
                description: 'The name of the loongson device console category'
            }),
            color1: '#FF3399',
            color2: '#CC297A',
            color3: '#CC297A',

            blocks: [
                {
                    opcode: 'consolePrint',
                    text: formatMessage({
                        id: 'atlas200dk.print.consolePrint',
                        default: 'print [TEXT]',
                        description: 'loongbian console print'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Huawei'
                        }
                    }
                },
                '---',
                {
                    opcode: 'screenInit',
                    text: formatMessage({
                        id: 'loongbian.print.screenInit',
                        default: 'oled init i2c [NO]',
                        description: 'loongbian oled screen init'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        NO: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'screenPrint',
                    text: formatMessage({
                        id: 'loongbian.print.screenPrint',
                        default: 'in x= [X] y= [Y], oled show [TEXT] with white',
                        description: 'loongbian oled screen print'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        Y:{
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Loongson'
                        },
                    },
                },
                {
                    opcode: 'screenClear',
                    text: formatMessage({
                        id: 'loongbian.print.screenClear',
                        default: 'clear screen with [COLOR]',
                        description: 'loongbian oled screen print'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu:'color',
                            defaultValue: "'black'"
                        },
                    },
                }
            ],
            menus: {    
                color: {
                    items: [
                    {
                        text:'白色',
                        value:"'white'"
                    },{
                        text:'黑色',
                        value:"'black'"
                    },
                ]
                },
            }
        },
        {
            id: 'sensor',
            name: formatMessage({
                id: 'loongbian.category.sensor',
                default: 'Sensor',
                description: 'The name of the loongbian device sensor category'
            }),
            color1: '#4CBFE6',
            color2: '#2E8EB8',
            color3: '#2E8EB8',

            blocks: [
                {
                    opcode: 'infrared',
                    text: formatMessage({
                        id: 'loongbian.sensor.infrared',
                        default: 'infrared [PIN] check line?',
                        description: 'wether loongbian infrared check line'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO4
                        }
                    }
                },
                {// DistanceSensor
                    opcode: 'distanceSensor',
                    text: formatMessage({
                        id: 'loongbian.sensor.distanceSensor',
                        default: 'distance sensor trigger=[TRIGGER] echo=[ECHO]',
                        description: 'distance sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TRIGGER: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO3
                        },
                        ECHO: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.GPIO4
                        }
                    }
                }     
                     
            ],
            menus: {
                pins: {
                    items: this.PINS_MENU
                }
            }
        },
        {
            id: 'net',
            name: formatMessage({
                id: 'loongbian.category.net',
                default: 'Net',
                description: 'The name of the loongson device net category'
            }),
            color1: '#FF3399',
            color2: '#CC297A',
            color3: '#CC297B',

            blocks: [
                {
                    opcode: 'onenetConnect',
                    text: formatMessage({
                        id: 'loongbian.net.onenetConnect',
                        default: 'connect with Product ID [PRODUCT_ID] Device ID [DEVICES_ID] Auth info [AUTH_INFO]',
                        description: 'loongbian sets the base information for connecting onenet'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PRODUCT_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: '533618'
                        },
                        DEVICES_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: '966637746'
                        },
                        AUTH_INFO: {
                            type: ArgumentType.STRING,
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'onenetPublish',
                    text: formatMessage({
                        id: 'loongbian.net.onenetPublish',
                        default: 'send data [DATA] to topic [TOPIC]',
                        description: 'loongbian uploads data to onenet'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '35.6'
                          },
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'temperature'
                        }
                    }
                },
                {
                    opcode: 'onenetGetInfo',
                    text: formatMessage({
                        id: 'loongbian.net.onenetGetInfo',
                        default: 'getinfo from server',
                        description: 'loongbian get data from onenet'
                    }),
                    blockType: BlockType.REPORTER,
                    disableMonitor: true
                },
                '---',
                {
                    opcode: 'huaweicloudConnect',
                    text: formatMessage({
                        id: 'loongbian.net.huaweicloudConnect',
                        default: 'connect huaweicloud with Device ID [DEVICES_ID] Auth info [AUTH_INFO]',
                        description: 'loongbian sets the base information for connecting huaweicloud'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DEVICES_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'mycompute'
                        },
                        AUTH_INFO: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Yy123456'
                        }
                    }
                },
                {
                    opcode: 'huaweicloudPublish',
                    text: formatMessage({
                        id: 'loongbian.net.huaweicloudPublish',
                        default: 'send value [VALUE] to [SERVICE_ID]\'s [PROPERTY] property ',
                        description: 'loongbian uploads data to huaweicloud'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '35.6'
                          },
                        PROPERTY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'LED'
                          },
                        SERVICE_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'test'
                        }
                    }
                },
                {
                    opcode: 'huaweicloudGetInfo',
                    text: formatMessage({
                        id: 'loongbian.net.huaweicloudGetInfo',
                        default: 'getinfo from server',
                        description: 'loongbian get data from huaweicloud'
                    }),
                    blockType: BlockType.REPORTER,
                    disableMonitor: true
                },
                '---',
                {
                    opcode: 'AT',
                    text: formatMessage({
                        id: 'loongbian.net.AT',
                        default: 'loongbian send AT [AT] instructions to USB',
                        description: 'send AT instructions to USB'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        AT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'AT'
                        }
                    }
                }
            ],
            menus: {}
        },
        {
            id: 'sounds',
            name: formatMessage({
                id: 'loongbian.category.sounds',
                default: 'sounds',
                description: 'The name of the loongson device sounds category'
            }),
            color1: '#CF63CF',
            color2: '#C94FC9',
            color3: '#C94FC9',

            blocks: [
                {
                    opcode: 'buzzer',
                    text: formatMessage({
                        id: 'loongbian.sounds.buzzer',
                        default: 'buzzer[PIN] play:[NOTE]',
                        description: 'loongbian buzzer'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pwmPins',
                            defaultValue: Pins.PWM0
                        },
                        NOTE:{
                            type: ArgumentType.STRING,
                            defaultValue: 'C'
                        }
                    }
                },
                {
                    opcode: 'buzzerStop',
                    text: formatMessage({
                        id: 'loongbian.sounds.buzzerStop',
                        default: 'buzzer[PIN] stop',
                        description: 'loongbian buzzer stop'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pwmPins',
                            defaultValue: Pins.PWM0
                        }
                    }
                }
            ],
            menus: {    
                pins: {
                    items: this.PINS_MENU
                },
                pwmPins: {
                    items: this.PWMS_MENU
                }
            }
        },
        {
            id: 'debug',
            name: formatMessage({
                id: 'loongbian.category.debug',
                default: 'debug tools',
                description: 'The name of the loongson device debug category'
            }),
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#3373CC',

            blocks: [
                {
                    opcode: 'try',
                    text: formatMessage({
                        id: 'loongbian.debug.try',
                        default: 'try...except',
                        description: 'loongbian:try..except'
                    }),
                    blockType: BlockType.LOOP,
                    arguments: {
                        SUBSTUCK: {
                            type: ArgumentType.MATRIX,
                            defaultValue: 'try'
                        }
                    }
                },
                {
                    opcode: 'except',
                    text: formatMessage({
                        id: 'loongbian.debug.except',
                        default: 'except',
                        description: 'loongbian:except'
                    }),
                    blockType: BlockType.LOOP,
                    arguments: {
                        SUBSTUCK: {
                            type: ArgumentType.MATRIX,
                            defaultValue: 'except'
                        }
                    }
                }
            ]
        }

        ]
    }
}

module.exports = OpenBlockAtlas200DKDevice;