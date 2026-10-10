const formatMessage = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const TxdBoardPeripheral = require('../common/micropython-peripheral');
const DIVECE_OPT = {
    type: 'txdboard'  //  告诉 openblock-link 使用哪种编译器和烧写软件来接收处理上传请求。
};
const PNPID_LIST = [
    'USB\\VID_10C4&PID_EA60',
]
const SERIAL_CONFIG = {} // 兼容性
/*************************************************pins list************************************************/
const Pins = {
    //IO0: '0',//BOOT,ADC
    //IO1: '1',//ADC
    IO2: '2',//ADC,LED
    IO4: '4',//ADC,水泵
    IO5: '5',//蜂鸣器
    IO12: '12',//ADC，暂时留空，影响烧录
    IO13: '13',//ADC，RGB灯珠
    IO14: '14',//ADC，土壤湿度传感器
    IO15: '15',//ADC
    //IO16: '16',// IO16 should be pulled-up and can not be used for other funtion
    IO17: '17',
    IO18: '18',//IIC-0
    IO19: '19',//IIC-0
    IO21: '21',//超声波
    IO22: '22',//超声波
    IO23: '23',//dht11
    IO25: '25',//舵机
    IO26: '26',//舵机
    IO27: '27',
    IO32: '32',//ADC，通信
    IO33: '33',//ADC，通信
    I34: '34',//ADC，按键
    I35: '35',//ADC
    I36: '36',//ADC
    I39: '39'//ADC
};

const Level = {
    High: '1',//高电平
    Low: '0'//低电平
};

const Station = {
    Off: '1',//关闭水泵
    On: '0'//开启水泵
};

const SentryStation = {
    Begin: 'Begin',//开启视觉算法状态
    End: 'End'
};

const Rotate = {
    zero: "0",
    Ninety: "90",
    OneHundredAndEighty: "180",
    TwoHundredAndSeventy: "270",
    ThreeHundredAndSixty: "360"
};

const SentryIIC = {
    L0: "0x60",
    L1: "0x61",
    L2: "0x62",
    L3: "0x63",
};

const Direction = {
    Forward: '1',
    Backward: '0',
    Stop: '-1'
};

const Color = {
    Black: '0',
    White: '1'
};

const RGB = {
    R: "(255,0,0)",
    G: "(0,0,255)",
    B: "(0,255,0)"
};

const Channel = {
    L0: "0",
    L1: "1",
    L2: "2",
    L3: "3"
};

const Coordinate = {
    Absolute_Coordinates: "0",
    Relative_Coordinates: "1"
};

const Algorithm = {
    SentryColor: "kVisionColor",
    SentryBlob: "kVisionBlob",
    SentryAprilTag: "kVisionAprilTag",
    SentryLine: "kVisionLine",
    SentryLearning: "kVisionLearning",
    SentryCard: "kVisionCard",
    SentryFace: "kVisionFace",
    Sentry20Classes: "kVision20Classes",
    SentryQrCode: "kVisionQrCode",
    SentryObjTrack: "kVisionObjTrack",
    SentryMotionDetect: "kVisionMotionDetect",
};

const Sentry = {
    Sentry1: "sentry1",
    Sentry2: "sentry2",
};

const AlgorithmInfo = {
    SentryXValue: "kXValue",
    SentryYValue: "kYValue",
    SentryWidthValue: "kWidthValue",
    SentryHeightValue: "kHeightValue",
    SentryLabel: "kLabel",
};

const QRCodeInfo = {
    QRCodeXValue: "1",
    QRCodeYValue: "2",
    QRCodeWidthValue: "3",
    QRCodeHeightValue: "4",
};

const Obiect = {
    colorRecognition: "kVisionColor",
    colorBlockDetection: "kVisionBlob",
    labelRecognition: "kVisionAprilTag",
    lineDetection: "kVisionLine",
    deepLearning: "kVisionLearning",
    cardRecognition: "kVisionCard",
    faceRecognition: "kVisionFace",
    twentyClassObject: "kVision20Classes",
    qrCode: "kVisionQrCode",
    custom: "kVisionObjTrack",
    movingObject: "kVisionMotionDetect",

};

const twentyClassObject = {
    Airplane: "kAirplane",
    Bird: "kBird",
    Bottle: "kBottle",
    Car: "kCar",
    Chair: "kChair",
    DiningTable: "kTable",
    Horse: "kHorse",
    Person: "kPerson",
    Sheep: "kSheep",
    Train: "kTrain",
    Bicycle: "kBicycle",
    Boat: "kBoat",
    Bus: "kBus",
    Cat: "kCat",
    Cow: "kCow",
    Dog: "kDog",
    Motorbike: "kBike",
    PottedPlant: "kPlant",
    Sofa: "kSofa",
    Tvmonitor: "kMonitor"
}

const Card = {
    Forward: "kCardForward",
    Left: "kCardLeft",
    Right: "kCardRight",
    TurnAround: "kCardTurnAround",

    Park: "kCardPark",
    GreenLight: "kCardGreenLight",
    RedLight: "kCardRedLight",

    CardSpeed40: "kCardCardSpeed40",
    CardSpeed60: "kCardCardSpeed60",
    CardSpeed80: "kCardCardSpeed80",

    Check: "kCardCheck",
    Cross: "kCardCross",

    Circle: "kCardCircle",
    Square: "kCardSquare",
    Triangle: "kCardTriangle",

    Plus: "kCardPlus",
    Minus: "kCardMinus",
    Divide: "kCardDivide",
    Equal: "kCardEqual",

    Zero: "kCardZero",
    One: "kCardOne",
    Two: "kCardTwo",
    Three: "kCardThree",
    Four: "kCardFour",
    Five: "kCardFive",
    Six: "kCardSix",
    Seven: "kCardSeven",
    Eight: "kCardEight",
    Nine: "kCardNine",

    A: "kCardA",
    B: "kCardB",
    C: "kCardC",
    D: "kCardD",
    E: "kCardE",
    F: "kCardF",
    G: "kCardG",
    H: "kCardH",
    I: "kCardI",
    J: "kCardJ",
    K: "kCardK",
    L: "kCardL",
    M: "kCardM",
    N: "kCardN",
    O: "kCardO",
    P: "kCardP",
    Q: "kCardQ",
    R: "kCardR",
    S: "kCardS",
    T: "kCardT",
    U: "kCardU",
    V: "kCardV",
    W: "kCardW",
    X: "kCardX",
    Y: "kCardY",
    Z: "kCardZ",
};

const ColorBlocks = {
    ColorBlack: "kColorBlack",
    ColorWhite: "kColorWhite",
    ColorRed: "kColorRed",
    ColorGreen: "kColorGreen",
    ColorBlue: "kColorBlue",
    ColorYellow: "kColorYellow",
    ColorUnkown: "kColorUnkown",
};

class TxdBoard extends TxdBoardPeripheral {
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
class OpenBlockTxdBoardDevice {
    static get DEVICE_ID() {
        // return "txdboard"; // 这个需要保持一致
        return DIVECE_OPT.type; // 这个需要保持一致
    }
    constructor(runtime) {
        /**
         * The OpenBlock runtime.
         * @type {Runtime}
         */
        this.runtime = runtime;
        this._peripheral = new TxdBoard(this.runtime, OpenBlockTxdBoardDevice.DEVICE_ID);
    }

    /*************************************************Menu list************************************************/
    get PINS_MENU() {
        return [
            {
                text: 'IO2',
                value: Pins.IO2
            },
            {
                text: 'IO4',
                value: Pins.IO4
            },
            {
                text: 'IO5',
                value: Pins.IO5
            },
            {
                text: 'IO12',
                value: Pins.IO12
            },
            {
                text: 'IO13',
                value: Pins.IO13
            },
            {
                text: 'IO14',
                value: Pins.IO14
            },
            {
                text: 'IO15',
                value: Pins.IO15
            },
            {
                text: 'IO17',
                value: Pins.IO17
            },
            {
                text: 'IO21',
                value: Pins.IO21
            },
            {
                text: 'IO22',
                value: Pins.IO22
            },
            {
                text: 'IO23',
                value: Pins.IO23
            },
            {
                text: 'IO25',
                value: Pins.IO25
            },
            {
                text: 'IO26',
                value: Pins.IO26
            },
            {
                text: 'IO27',
                value: Pins.IO27
            },
            {
                text: 'IO32',
                value: Pins.IO32
            },
            {
                text: 'IO33',
                value: Pins.IO33
            },
            {
                text: 'I34',
                value: Pins.I34
            },
            {
                text: 'I35',
                value: Pins.I35
            },
            {
                text: 'I36',
                value: Pins.I36
            },
            {
                text: 'I39',
                value: Pins.I39
            }
        ];
    }
    get IN_PINS_MENU() {//在ESP32上，ADC功能在引脚32-39（ADC块1）和引脚0、2、4、12-15和25-27（ADC块2）上可用。
        return [
            {
                text: 'IO2',
                value: Pins.IO2
            },
            {
                text: 'IO12',
                value: Pins.IO12
            },
            {
                text: 'IO13',
                value: Pins.IO13
            },
            {
                text: 'IO14',
                value: Pins.IO14
            },
            {
                text: 'IO15',
                value: Pins.IO15
            },
            {
                text: 'IO17',
                value: Pins.IO17
            },
            {
                text: 'IO21',
                value: Pins.IO21
            },
            {
                text: 'IO22',
                value: Pins.IO22
            },
            {
                text: 'IO23',
                value: Pins.IO23
            },
            {
                text: 'IO27',
                value: Pins.IO27
            },
            {
                text: 'IO32',
                value: Pins.IO32
            },
            {
                text: 'IO33',
                value: Pins.IO33
            },
            {
                text: 'I36',
                value: Pins.I36
            },
            {
                text: 'I39',
                value: Pins.I39
            }
        ];
    }
    get OUT_PINS_MENU() {
        return [
            {
                text: 'IO2',
                value: Pins.IO2
            },
            {
                text: 'IO12',
                value: Pins.IO12
            },
            {
                text: 'IO13',
                value: Pins.IO13
            },
            {
                text: 'IO14',
                value: Pins.IO14
            },
            {
                text: 'IO15',
                value: Pins.IO15
            },
            {
                text: 'IO17',
                value: Pins.IO17
            },
            {
                text: 'IO21',
                value: Pins.IO21
            },
            {
                text: 'IO22',
                value: Pins.IO22
            },
            {
                text: 'IO23',
                value: Pins.IO23
            },
            {
                text: 'IO27',
                value: Pins.IO27
            },
            {
                text: 'IO32',
                value: Pins.IO32
            },
            {
                text: 'IO33',
                value: Pins.IO33
            }
        ];
    }
    get COLOR_MENU() {
        return Object.entries(Color).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.colorMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} color`
            }),
            value: value
        }));
    }
    get LEVEL_MENU() {
        return Object.entries(Level).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.levelMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} level`
            }),
            value: value
        }));
    }
    get STATION_MENU() {//打开和关闭水泵
        return Object.entries(Station).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.stationMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} station`
            }),
            value: value
        }));
    }
    get VISIONSTATION_MENU() {//打开和关闭水泵
        return Object.entries(SentryStation).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.stationMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} SentryStation`
            }),
            value: value
        }));
    }
    get COORDINATE_MENU() {//打开和关闭水泵
        return Object.entries(Coordinate).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.CoordinateMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} Coordinate`
            }),
            value: value
        }));
    }
    get SentryIIC_MENU() {
        return Object.entries(SentryIIC).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.SentryIICMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} SentryII address`
            }),
            value: value
        }));
    }
    get RGB_MENU() {
        return Object.entries(RGB).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.rgbMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} color`
            }),
            value: value
        }));
    }
    get DIRECTION_MENU() {
        return Object.entries(Direction).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.levelMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} direction`
            }),
            value: value
        }));
    }
    get SCL_MENU() {
        return [
            {
                text: 'IO18',
                value: Pins.IO18
            },
        ];
    }
    get SDA_MENU() {
        return [
            {
                text: 'IO19',
                value: Pins.IO19
            },
        ];
    }
    get SCLPCA9685_MENU() {
        return [
            {
                text: 'IO25',
                value: Pins.IO25
            },
        ];
    }
    get SDAPCA9685_MENU() {
        return [
            {
                text: 'IO26',
                value: Pins.IO26
            },
        ];
    }
    get CHANNEL_MENU() {
        return Object.entries(Channel).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.channelMenu.${key}`,
                default: key.charAt(0).toUpperCase() + key.slice(1),
                description: `Label for ${key.toLowerCase()} Channel`
            }),
            value: value
        }));
    }
    get DCWATER_MENU() {
        return [
            {
                text: 'IO4',
                value: Pins.IO4
            },
        ];
    }
    get DEGREE_MENU() {
        return [
            {
                text: '0',
                value: Rotate.zero
            },
            {
                text: '90',
                value: Rotate.Ninety
            },
            {
                text: '180',
                value: Rotate.OneHundredAndEighty
            },
            {
                text: '270',
                value: Rotate.TwoHundredAndSeventy
            },
            {
                text: '360',
                value: Rotate.ThreeHundredAndSixty
            }
        ];
    }
    get ALGORITHM_MENU() {
        return Object.entries(Algorithm).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.algorithmMenu.${key}`,
                default: key,
                description: `Label for ${key.toLowerCase()} Algorithm`
            }),
            value: value
        }));
    }
    get SENTRY_MENU() {
        return Object.entries(Sentry).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.sentryMenu.${key}`,
                default: key,
                description: `list for ${key.toLowerCase()} devices`
            }),
            value: value
        }));
    }
    get ALGORITHMINFO_MENU() {
        return Object.entries(AlgorithmInfo).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.algorithmInfoMenu.${key}`,
                default: key,
                description: `Label for ${key.toLowerCase()} Algorithm info`
            }),
            value: value
        }));
    }
    get QRCODEINFO_MENU() {
        return Object.entries(QRCodeInfo).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.qrcodeInfoMenu.${key}`,
                default: key,
                description: `${key.replace(/([A-Z])/g, ' $1')} of the QR code`
            }),
            value: value
        }));
    }
    get OBJECT_MENU() {
        return Object.entries(Obiect).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.objectMenu.${key}`,
                default: key, // 将驼峰命名转换为带空格的字符串
                description: `Algorithm for ${key.replace(/([A-Z])/g, ' $1').toLowerCase().trim()}`
            }),
            value: value
        }));
    }
    get TWENTY_CLASS_OBJECT_MENU() {
        return Object.entries(twentyClassObject).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.twentyClassObjectMenu.${key}`,
                default: key,
                description: `Algorithm for recognizing ${key.toLowerCase()}`
            }),
            value: value
        }));
    }
    get CARD_MENU() {
        return Object.entries(Card).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.cardMenu.${key}`,
                default: key,
                description: `Card action or symbol for ${key.toLowerCase()}`
            }),
            value: value
        }));
    }
    get COLOR_BLOCKS_MENU() {
        return Object.entries(ColorBlocks).map(([key, value]) => ({
            text: formatMessage({
                id: `microPython.colorBlocksMenu.${key}`,
                default: key,
                description: `Color block for ${key.replace('Color', '').toLowerCase().trim()}`
            }),
            value: value
        }));
    }

    getInfo() {
        return [{
            id: 'pin',
            name: formatMessage({
                id: 'microPython.category.pins', // pins
                default: 'Pins',
                description: 'The name of the txdboard device pin category'
            }),
            color1: '#4C97FF',
            color2: '#3373CC',
            color3: '#3373CC',

            blocks: [
                // txdboard_pins_setDigitalOutput
                {
                    opcode: 'setDigitalOutput',
                    text: formatMessage({
                        id: 'microPython.pin.setDigitalOutput',
                        default: 'set digital pin [PIN] out [LEVEL]',
                        description: 'TxdBoard set digital pin out'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'out_pins',
                            defaultValue: Pins.IO2
                        },
                        LEVEL: {
                            type: ArgumentType.STRING,
                            menu: 'level', // 和下方menu对应
                            defaultValue: Level.High
                        }
                    }
                },
                {//setPwmOutput
                    opcode: 'setPwmOutput',
                    text: formatMessage({
                        id: 'microPython.pins.setPwmOutput',
                        default: 'set pwm pin [PIN] out [OUT]',
                        description: 'TxdBoard set pwm pin out'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'out_pins',
                            defaultValue: Pins.IO12
                        },
                        OUT: {
                            type: ArgumentType.UINT10_NUMBER,
                            defaultValue: '80'
                        }
                    }
                },
                //L298N
                {
                    opcode: 'motor',
                    text: formatMessage({
                        id: 'microPython.pins.motor',
                        default: 'pin [PIN1] and pin [PIN2] control direction [DIRECTION]',
                        description: 'microPython pin '
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN1: {
                            type: ArgumentType.STRING,
                            menu: 'out_pins',
                            defaultValue: Pins.IO14
                        },
                        PIN2: {
                            type: ArgumentType.STRING,
                            menu: 'out_pins',
                            defaultValue: Pins.IO15
                        },
                        DIRECTION: {
                            type: ArgumentType.NUMBER,
                            menu: 'direction',
                            defaultValue: Direction.Forward
                        }
                    }
                },
                //read Digital Pin
                {
                    opcode: 'readDigitalPin',
                    text: formatMessage({
                        id: 'microPython.pins.readDigitalPin',
                        default: 'read digital pin [PIN]',
                        description: 'microPython read digital pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'in_pins',
                            defaultValue: Pins.I34
                        }
                    }
                },
                //read ADC Pin
                {
                    opcode: 'readADCPin',
                    text: formatMessage({
                        id: 'microPython.pins.readADCPin',
                        default: 'read ADC pin [PIN]',
                        description: 'microPython read ADC pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'in_pins',
                            defaultValue: Pins.I35
                        }
                    }
                }
            ],
            menus: {
                pins: {
                    items: this.PINS_MENU
                },
                level: {
                    //acceptReporters: true,
                    items: this.LEVEL_MENU
                },
                in_pins: {
                    items: this.IN_PINS_MENU
                },
                direction: {
                    items: this.DIRECTION_MENU
                },
                out_pins: {
                    items: this.OUT_PINS_MENU
                },
                station: {
                    //acceptReporters: true,
                    items: this.STATION_MENU
                }
            }
        },
        //print
        {
            id: 'print',
            name: formatMessage({
                id: 'microPython.category.print',
                default: 'Print',
                description: 'The name of the microPython device console category'
            }),
            color1: '#FF3399',
            color2: '#CC297A',
            color3: '#CC297A',

            blocks: [
                {//在控制台打印
                    opcode: 'consolePrint',
                    text: formatMessage({
                        id: 'microPython.print.consolePrint',
                        default: 'print [TEXT] at console',
                        description: 'TxdBoard console print'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello World!'
                        }
                    }
                },
                {//init OLED
                    opcode: 'screenInit',
                    text: formatMessage({
                        id: 'microPython.print.screenInit',
                        default: 'init OLED by SCL = [SCL], SDA = [SDA], rotate= [ROTATE]',
                        description: 'init oled'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SCL: {
                            type: ArgumentType.STRING,
                            menu: 'SCL',
                            defaultValue: Pins.IO18
                        },
                        SDA: {
                            type: ArgumentType.STRING,
                            menu: 'SDA',
                            defaultValue: Pins.IO19
                        },
                        ROTATE: {
                            type: ArgumentType.STRING,
                            menu: 'rotate',
                            defaultValue: Rotate.OneHundredAndEighty
                        }
                    },
                },
                {//在OLED上显示文本
                    opcode: 'screenPrint',
                    text: formatMessage({
                        id: 'microPython.print.screenPrint',
                        default: 'on the [X] lines of oled show [TEXT] with white',
                        description: 'TxdBoard oled screen print'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                            type: ArgumentType.UINT3_NUMBER,
                            defaultValue: '0'
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello World!'
                        }
                    },
                },
                {//画一条直线
                    opcode: 'drawLine',
                    text: formatMessage({
                        id: 'microPython.print.drawLine',
                        default: 'Draw a straight line from [X],[Y]to [U],[V]',
                        description: 'Draw a straight line on oled'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                            type: ArgumentType.UINT7_NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: ArgumentType.UINT6_NUMBER,
                            defaultValue: '0'
                        },
                        U: {
                            type: ArgumentType.UINT7_NUMBER,
                            defaultValue: '127'
                        },
                        V: {
                            type: ArgumentType.UINT6_NUMBER,
                            defaultValue: '63'
                        }
                    }
                },
                {//画矩形
                    opcode: 'drawRectangle',
                    text: formatMessage({
                        id: 'microPython.print.drawRectangle',
                        default: 'Draw a rectangle starting with x=[x],y=[Y],and width=[W],height=[H]',
                        description: 'Draw a rectangle on oled'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                            type: ArgumentType.UINT7_NUMBER,
                            defaultValue: '0'
                        },
                        Y: {
                            type: ArgumentType.UINT6_NUMBER,
                            defaultValue: '0'
                        },
                        W: {
                            type: ArgumentType.UINT7_NUMBER,
                            defaultValue: '127'
                        },
                        H: {
                            type: ArgumentType.UINT6_NUMBER,
                            defaultValue: '63'
                        }
                    }
                },
                {//画圆形  
                    opcode: 'drawCircle',
                    text: formatMessage({
                        id: 'microPython.print.drawCircle',
                        default: 'Draw a circle starting with center x=[X], y=[Y], radius=[R]',
                        description: 'Draw a circle on OLED'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        X: {
                            type: ArgumentType.UINT7_NUMBER,
                            defaultValue: '60'  // 默认圆心 X 坐标
                        },
                        Y: {
                            type: ArgumentType.UINT6_NUMBER,
                            defaultValue: '30'  // 默认圆心 Y 坐标
                        },
                        R: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '10'  // 默认半径
                        }
                    }
                },
                {//清空OLED屏幕
                    opcode: 'screenClear',
                    text: formatMessage({
                        id: 'microPython.print.screenClear',
                        default: 'clear screen',
                        description: 'txdBoard oled screen print'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                    },
                }
            ],
            menus: {
                SCL: {
                    items: this.SCL_MENU
                },
                SDA: {
                    items: this.SDA_MENU
                },
                rotate: {
                    items: this.DEGREE_MENU
                },
                color: {
                    items: this.COLOR_MENU
                },
                pins: {
                    // acceptReporters: true,
                    items: this.PINS_MENU
                },
                channel: {
                    items: this.CHANNEL_MENU
                }
            }
        },
        //connect network
        {
            id: 'IOT',
            name: formatMessage({
                id: 'microPython.category.IOT',
                default: 'network',
                description: 'Internet of things'
            }),
            color1: '#9966FF',
            color2: '#774DCB',
            color3: '#774DCB',
            blocks: [
                {
                    opcode: 'connectWiFi',
                    text: formatMessage({
                        id: 'microPython.IOT.connectWiFi',
                        default: 'input the [ESSID] and [PASSWORD] of wifi',
                        description: 'connect wifi'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        ESSID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'G'
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'goodlife'
                        }
                    }
                },
                {
                    opcode: 'disconnectWiFi',
                    text: formatMessage({
                        id: 'microPython.IOT.disconnectWiFi',
                        default: 'disconnect wifi',
                        description: 'disconnect wifi'
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'connectMQTTServer',
                    text: formatMessage({
                        id: 'microPython.IOT.connectMQTTServer',
                        default: 'Connect to MQTT Server: [SERVER], Port: [PORT]',
                        description: 'Connect to MQTT Server with user and password'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SERVER: {
                            type: ArgumentType.STRING,
                            defaultValue: 'broker.emqx.io'
                        },
                        PORT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1883
                        }
                    }
                },
                {
                    opcode: 'publishData',
                    text: formatMessage({
                        id: 'microPython.IOT.publishData',
                        default: 'Send [DATA] to the [TOPIC]',
                        description: 'Publish data to the topic'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '2025'
                        },
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'TOPIC'
                        }
                    }
                },
                {
                    opcode: 'subscribeTopic',
                    text: formatMessage({
                        id: 'microPython.IOT.subscribeTopic',
                        default: 'Subscribe to the [TOPIC]',
                        description: 'Subscribe to the topic'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'G'
                        }
                    }
                },
                {
                    opcode: 'waitMsgFromTopic',
                    text: formatMessage({
                        id: 'microPython.IOT.waitMsgFromTopic',
                        default: 'wait msg from topic',
                        description: 'wait msg from topic'
                    }),
                    blockType: BlockType.COMMAND,
                },
                {
                    opcode: 'setCallback',
                    text: formatMessage({
                        id: 'microPython.IOT.setCallback',
                        default: 'when receive msg from topic',
                        description: 'Set the callback function'
                    }),
                    blockType: BlockType.HAT,
                },
                {
                    opcode: 'msg',
                    text: formatMessage({
                        id: 'microPython.IOT.msg',
                        default: 'Received topic information',
                        description: 'Received topic information'
                    }),
                    blockType: BlockType.REPORTER,
                },

            ]
        },
        {
            id: 'sensor',
            name: formatMessage({
                id: 'microPython.category.sensor',
                default: 'Sensor',
                description: 'The name of the microPython device sensor category'
            }),
            color1: '#4CBFE6',
            color2: '#2E8EB8',
            color3: '#2E8EB8',

            blocks: [
                {//红外传感器
                    opcode: 'infrared',
                    text: formatMessage({
                        id: 'microPython.sensor.infrared',
                        default: 'infrared [PIN] check line',
                        description: 'wether microPython infrared check line'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO12
                        }
                    }
                },
                '---',
                {// 超声波传感器
                    opcode: 'distanceSensor',
                    text: formatMessage({
                        id: 'microPython.sensor.distanceSensor',
                        default: 'distance sensor trigger=[TRIG] echo=[ECHO]',
                        description: 'distance sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        TRIG: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO21
                        },
                        ECHO: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO22
                        }
                    }
                },
                '---',
                {// 湿度传感器启动测量
                    opcode: 'DHTMEASURE',//测量
                    text: formatMessage({
                        id: 'microPython.sensor.DHTMEASURE',
                        default: 'let [PIN] start measure humidity and temperature for once',
                        description: 'let dht11 start measure humidity and temperature for once'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO23
                        }
                    }
                },
                {// 湿度传感器
                    opcode: 'DH',//湿度
                    text: formatMessage({
                        id: 'microPython.sensor.DH',
                        default: 'get humidity from [PIN]',
                        description: 'DHT sensor(humidity)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO23
                        }
                    }
                },
                {// 温度传感器
                    opcode: 'DT',//温度
                    text: formatMessage({
                        id: 'microPython.sensor.DT',
                        default: 'get temperature from [PIN]',
                        description: 'DHT sensor(temperature)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO23
                        }
                    }
                },
                '---',
                {// 光照传感器
                    opcode: 'BH1750',
                    text: formatMessage({
                        id: 'microPython.sensor.BH1750',
                        default: ' from scl = [SCL] sda = [SDA] get Light intensity',
                        description: 'BH1750 sensor(Light intensity)'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SCL: {
                            type: ArgumentType.STRING,
                            menu: "pins",
                            defaultValue: Pins.IO21
                        },
                        SDA: {
                            type: ArgumentType.STRING,
                            menu: "pins",
                            defaultValue: Pins.IO22
                        }
                    }
                },
                {
                    opcode: 'Photoresistance',
                    text: formatMessage({
                        id: 'microPython.sensor.Photoresistance',
                        default: 'read Photoresistance from pin [PIN]',
                        description: 'microPython read ADC pin'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'in_pins',
                            defaultValue: Pins.I35
                        }
                    }
                },
                {//光敏 相对
                    opcode: 'PhotoresistanceRelative',
                    text: formatMessage({
                        id: 'microPython.sensor.PhotoresistanceRelative',
                        default: 'Read the relative Photoresistance from [PIN], with calibration parameters: value in light = [LIGHT], value in dark = [DARK]',
                        description: 'TxdBoard read soil moisture sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.I35
                        },
                        LIGHT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '4095'
                        },
                        DARK: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                '---',
                {//土壤湿度传感器
                    opcode: 'soilMoistureSensor',
                    text: formatMessage({
                        id: 'microPython.sensor.soilMoistureSensor',
                        default: 'Read the relative humidity from [PIN], with calibration parameters: humidity in water = [WATER], humidity in air = [AIR]',
                        description: 'TxdBoard read soil moisture sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO14
                        },
                        WATER: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '4095'
                        },
                        AIR: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {//土壤湿度传感器
                    opcode: 'soilMoistureSensorAbsolute',
                    text: formatMessage({
                        id: 'microPython.sensor.soilMoistureSensorAbsolute',
                        default: 'Read the absolute humidity from [PIN]',
                        description: 'TxdBoard read absolute soil moisture sensor'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO14
                        }
                    }
                }
            ],
            menus: {
                pins: {
                    // acceptReporters: true,
                    items: this.PINS_MENU
                },
                in_pins: {
                    // acceptReporters: true,
                    items: this.IN_PINS_MENU
                },
                level: {
                    acceptReporters: true,
                    items: this.LEVEL_MENU
                },
                station: {
                    acceptReporters: true,
                    items: this.STATION_MENU
                }
            }
        },
        //
        {
            id: 'other',
            name: formatMessage({
                id: 'microPython.category.other',
                default: 'network',
                description: 'Other related devices'
            }),
            color1: '#E50CF3',
            color2: '#AF0DF2',
            color3: '#AF0DF2',
            blocks: [
                {//init ws2812 RGB灯
                    opcode: 'RGBInit',
                    text: formatMessage({
                        id: 'microPython.other.RGBInit',
                        default: 'Pin [PIN] controls [NUM] RGB lights',
                        description: 'RGB Init'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'out_pins',
                            defaultValue: Pins.IO13
                        },
                        NUM: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '30'
                        },
                    }
                },
                {//ws2812 RGB灯
                    opcode: 'RGB',
                    text: formatMessage({
                        id: 'microPython.other.RGB',
                        default: 'single RGB lights in color Red =[R],Green =[G],Blue =[B]',
                        description: 'pin controls the RGB lamp color'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        R: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '255'
                        },
                        G: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '0'
                        },
                        B: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {//ws2812 RGBs灯
                    opcode: 'RGBs',
                    text: formatMessage({
                        id: 'microPython.other.RGBs',
                        default: 'Pin [PIN] controls [NUM] RGB lights in color Red =[R],Green =[G],Blue =[B]',
                        description: 'pin controls the RGB lamp color'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        R: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '255'
                        },
                        G: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '0'
                        },
                        B: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                {//ws2812 RGBsIndex灯
                    opcode: 'RGBsIndex',
                    text: formatMessage({
                        id: 'microPython.other.RGBsIndex',
                        default: 'controls the [INDEX] light to display the color Red =[R],Green =[G],Blue =[B]',
                        description: 'pin controls the RGB lamp color'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '15'
                        },
                        R: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '255'
                        },
                        G: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '0'
                        },
                        B: {
                            type: ArgumentType.UINT8_NUMBER,
                            defaultValue: '0'
                        }
                    }
                },
                '---',
                {//直流电机
                    opcode: 'dcWaterPump',
                    text: formatMessage({
                        id: 'microPython.other.dcWaterPump',
                        default: 'set digital pin [PIN] out [STATION]',
                        description: 'TxdBoard set digital pin out'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'dcwater_pins',
                            defaultValue: Pins.IO4
                        },
                        STATION: {
                            type: ArgumentType.STRING,
                            menu: 'station', // 和下方menu对应
                            defaultValue: Station.Off
                        }
                    }
                },
                '---',
                {//舵机init
                    opcode: 'PCA9685Init',
                    text: formatMessage({
                        id: 'microPython.other.PCA9685Init',
                        default: 'init PCA9685 by SCL = [SCL] and SDA = [SDA]',
                        description: 'init  pca9685'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SCL: {
                            type: ArgumentType.STRING,
                            menu: 'scl',
                            defaultValue: Pins.IO25
                        },
                        SDA: {
                            type: ArgumentType.STRING,
                            menu: 'sda',
                            defaultValue: Pins.IO26
                        }
                    }
                },
                {//舵机
                    opcode: 'PCA9685SetAngle',
                    text: formatMessage({
                        id: 'microPython.other.PCA9685SetAngle',
                        default: 'set [CHANNEL] and [DEGREES] of pca9685',
                        description: 'set control information of  pca9685'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CHANNEL: {
                            type: ArgumentType.STRING,
                            menu: 'channel',
                            defaultValue: Channel.L0
                        },
                        DEGREES: {
                            type: ArgumentType.OTO180_NUMBER,
                            defaultValue: '80'
                        }
                    }
                },
                '---',
                {//蜂鸣器
                    opcode: 'buzzer',
                    text: formatMessage({
                        id: 'microPython.other.buzzer',
                        default: 'Pin [PIN] controls the buzzer sound at a duty cycle of [DUTY] and a frequency of [FREQ]',
                        description: 'set control information of  buzzer'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO5
                        },
                        DUTY: {
                            type: ArgumentType.UINT10_NUMBER,
                            defaultValue: '80'
                        },
                        FREQ: {
                            type: ArgumentType.NUMBER,
                            defaultValue: '600'
                        }
                    }
                },
                {//关闭蜂鸣器
                    opcode: 'closeBuzzer',
                    text: formatMessage({
                        id: 'microPython.other.closeBuzzer',
                        default: 'close buzzer of Pin [PIN]',
                        description: 'close buzzer'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        PIN: {
                            type: ArgumentType.STRING,
                            menu: 'pins',
                            defaultValue: Pins.IO5
                        }
                    }
                },
                '---',
            ],
            menus: {
                pins: {
                    items: this.PINS_MENU
                },
                out_pins: {
                    items: this.OUT_PINS_MENU
                },
                dcwater_pins: {
                    items: this.DCWATER_MENU
                },
                station: {
                    //acceptReporters: true,对于积木块下拉选项，该参数全部注释
                    items: this.STATION_MENU
                },
                channel: {
                    items: this.CHANNEL_MENU
                },
                scl: {
                    items: this.SCLPCA9685_MENU
                },
                sda: {
                    items: this.SDAPCA9685_MENU
                },
            }
        },
        //视觉和语音
        {
            id: 'visionAndSpeech',
            name: formatMessage({
                id: 'microPython.category.visionAndSpeech',
                default: 'visionAndSpeech',
                description: 'initialize vision and speech'
            }),
            color1: '#ff8a65',
            color2: '#e64a19',
            color3: '#e64a19',
            blocks: [
                {
                    opcode: 'broadcast',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.broadcast',
                        default: 'broadcast [CONTENT]',
                        description: 'announcement content'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        CONTENT: {
                            type: ArgumentType.STRING,
                            defaultValue: '南强派'
                        }
                    },
                },
                {
                    opcode: 'Sentryinit',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.Sentryinit',
                        default: 'Initialize [SENTRY] with SCL = [SCL], SDA = [SDA], address = [ADDRESS], and output coordinate mode = [COORDINATE].',
                        description: 'Initialize the IIC pins, address, and coordinate format for the Sentry.'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        SCL: {
                            type: ArgumentType.STRING,
                            menu: 'OUT_PINS_MENU',
                            defaultValue: Pins.IO12
                        },
                        SDA: {
                            type: ArgumentType.STRING,
                            menu: 'OUT_PINS_MENU',
                            defaultValue: Pins.IO13
                        },
                        ADDRESS: {
                            type: ArgumentType.STRING,
                            menu: "SentryIIC_MENU",
                            defaultValue: SentryIIC.L0
                        },
                        COORDINATE: {
                            type: ArgumentType.STRING,
                            menu: 'COORDINATE_MENU',
                            defaultValue: Coordinate.Absolute_Coordinates
                        }
                    },
                },
                {
                    opcode: 'SentryenableAlgorithm',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.Sentryenablegorithm',
                        default: '[SENTRY] [ENABLE] [ALGORITHM]',
                        description: 'Enable the Sentry algorithm'
                    }),
                    blockType: BlockType.COMMAND,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        ENABLE: {
                            type: ArgumentType.STRING,
                            menu: 'VISIONSTATION_MENU',
                            defaultValue: SentryStation.Begin
                        },
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'ALGORITHM_MENU',
                            defaultValue: Algorithm.SentryColor
                        }
                    },
                },
                {
                    opcode: 'Sentryreset',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.Sentryreset',
                        default: 'reset Sentry',
                        description: 'reset Sentry'
                    }),
                    blockType: BlockType.COMMAND,
                },
                {//
                    opcode: 'SentrymultiObjectRecognition',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentrymultiObjectRecognition',
                        default: '[SENTRY] Whether the 20-class [OBJECT] is recognized.',
                        description: 'Whether the 20-class object is recognized.'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        OBJECT: {
                            type: ArgumentType.STRING,
                            menu: 'TWENTY_CLASS_OBJECT_MENU',
                            defaultValue: twentyClassObject.Airplane
                        }
                    }
                },
                {//
                    opcode: 'SentrycardRecognition',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentrycardRecognition',
                        default: '[SENTRY] Whether the [CARD] is recognized by the Sentry.',
                        description: 'Whether the card is recognized by the Sentry.'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        CARD: {
                            type: ArgumentType.STRING,
                            menu: 'CARD_MENU',
                            defaultValue: Card.Forward
                        }
                    }
                },
                {//
                    opcode: 'SentrycolorBlocksRecognition',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentrycolorBlocksRecognition',
                        default: '[SENTRY] Whether the color blocks [COLORBLOCKS] are recognized by the Sentry.',
                        description: 'Whether the color blocks code blocks are recognized by the Sentry.'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        COLORBLOCKS: {
                            type: ArgumentType.STRING,
                            menu: 'COLOR_BLOCKS_MENU',
                            defaultValue: ColorBlocks.Black
                        }
                    }
                },
                {//
                    opcode: 'SentrycolorRecognition',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentryobjectRecognition',
                        default: '[SENTRY] Whether the color [COLOR] is recognized by the Sentry.',
                        description: 'Whether the color color is recognized by the Sentry.'
                    }),
                    blockType: BlockType.BOOLEAN,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        COLOR: {
                            type: ArgumentType.STRING,
                            menu: 'COLOR_BLOCKS_MENU',
                            defaultValue: ColorBlocks.Black
                        }
                    }
                },
                {//
                    opcode: 'SentryQRcodeDetectResults',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentryQRcodeDetectResults',
                        default: 'Obtain the QR code recognition result',
                        description: 'Obtain the QR code recognition result'
                    }),
                    blockType: BlockType.REPORTER,
                },
                {//
                    opcode: 'SentryQRcodeDetectInfo',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentryQRcodeDetectInfo',
                        default: '[SENTRY] Get the QR code recognition [INFO]',
                        description: 'Get the QR code recognition info'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        INFO: {
                            type: ArgumentType.STRING,
                            menu: 'QRCODEINFO_MENU',
                            defaultValue: QRCodeInfo.QRCodeXValue
                        }
                    }
                },
                {//
                    opcode: 'SentrygetResults',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentrygetResults',
                        default: '[SENTRY] Get the [ALGORITHM] results [INFO] from the Sentry.',
                        description: 'Get the algorithm results info from the Sentry.'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'ALGORITHM_MENU',
                            defaultValue: Algorithm.SentryColor
                        },
                        INFO: {
                            type: ArgumentType.STRING,
                            menu: 'ALGORITHMINFO_MENU',
                            defaultValue: AlgorithmInfo.SentryXValue
                        }
                    }
                },
                {//
                    opcode: 'SentrygetResultsNumber',
                    text: formatMessage({
                        id: 'microPython.visionAndSpeech.SentrygetResultsNumber',
                        default: '[SENTRY] Obtain number results from the Sentry [ALGORITHM]',
                        description: 'Obtain number results from the Sentry algorithm'
                    }),
                    blockType: BlockType.REPORTER,
                    arguments: {
                        SENTRY: {
                            type: ArgumentType.STRING,
                            menu: 'SENTRY_MENU',
                            defaultValue: Sentry.Sentry1
                        },
                        ALGORITHM: {
                            type: ArgumentType.STRING,
                            menu: 'ALGORITHM_MENU',
                            defaultValue: Algorithm.SentryColor
                        }
                    }
                },

            ],
            menus: {
                SENTRY_MENU: {
                    items: this.SENTRY_MENU
                },
                COORDINATE_MENU: {
                    items: this.COORDINATE_MENU
                },
                SentryIIC_MENU: {
                    items: this.SentryIIC_MENU
                },
                OUT_PINS_MENU: {
                    items: this.OUT_PINS_MENU
                },
                ALGORITHMINFO_MENU: {
                    items: this.ALGORITHMINFO_MENU
                },
                ALGORITHM_MENU: {
                    items: this.ALGORITHM_MENU
                },
                VISIONSTATION_MENU: {
                    items: this.VISIONSTATION_MENU
                },
                TWENTY_CLASS_OBJECT_MENU: {
                    items: this.TWENTY_CLASS_OBJECT_MENU
                },
                CARD_MENU: {
                    items: this.CARD_MENU
                },
                QRCODEINFO_MENU: {
                    items: this.QRCODEINFO_MENU
                },
                COLOR_BLOCKS_MENU: {
                    items: this.COLOR_BLOCKS_MENU
                }

            }
        },
        ]
    }
}

module.exports = OpenBlockTxdBoardDevice;