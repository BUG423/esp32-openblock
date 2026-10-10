const Buffer = require('buffer').Buffer;

const WiFi = require('../../io/wifi');
const Base64Util = require('../../util/base64-util');

/**
 * Manage communication with a common peripheral over a OpenBlock Link client socket.
 */
class LoongsonPeripheral {

    /**
     * Construct a common communication object.
     * @param {Runtime} runtime - the OpenBlock runtime
     * @param {string} deviceId - the id of the peripheral
     * @param {string} originalDeviceId - the original id of the peripheral, like xxx_arduinoUno
     * @param {object} pnpidList - the pnp id of the peripheral
     * @param {object} serialConfig - the serial config of the peripheral
     * @param {object} deviceOpt - the device optione of the peripheral
     */
    constructor(runtime, deviceId, originalDeviceId, pnpidList, serialConfig, deviceOpt) {
        /**
         * The OpenBlock runtime used to trigger the green flag button.
         * @type {Runtime}
         * @private
         */
        this._runtime = runtime;

        this.pnpidList = pnpidList;
        this.serialConfig = serialConfig;
        this.deviceOpt = deviceOpt;

        /**
         * The WiFi connection socket for reading/writing peripheral data.
         * @type {WiFi}
         * @private
         */
        this._WiFi = null;
        this._runtime.registerPeripheralExtension(deviceId, this);
        this._runtime.setRealtimeBaudrate(this.serialConfig.baudRate);

        /**
         * The id of the peripheral this peripheral belongs to.
         */
        this._deviceId = deviceId;

        this._originalDeviceId = originalDeviceId;

        /**
        * Pending data list. If busy is set when send, the data will push into this array to
        * waitting to be sended.
        */
        this._pendingData = [];

        this.reset = this.reset.bind(this);
        this._onConnect = this._onConnect.bind(this);
        this._onMessage = this._onMessage.bind(this);
    }

    /**
     * Called by the runtime when user wants to upload code to a peripheral.
     * @param {string} code - the code want to upload.
     */
    upload(code) {
        const base64Str = Buffer.from(code).toString('base64');
        this._WiFi.upload(base64Str, this.deviceOpt, 'base64');
    }

    /**
     * Called by the runtime when user wants to upload realtime firmware to a peripheral.
     */
    uploadFirmware() {
    }

    /**
     * Called by the runtime when user wants to scan for a peripheral.
     * @param {Array.<string>} pnpidList - the array of pnp id list
     * @param {bool} listAll - wether list all connectable device
     */
    scan(pnpidList, listAll) {
        if (this._WiFi) {
            this._WiFi.disconnect(); // wifi不为空
        }
        console.log("Micropython scan")
        this._WiFi = new WiFi(this._runtime, this._originalDeviceId, {
            filters: {
                pnpid: listAll ? ['*'] : (pnpidList ? pnpidList : this.pnpidList)
            }
        }, this._onConnect, this.reset);
    }

    /**
     * Called by the runtime when user wants to connect to a certain peripheral.
     * @param {number} id - the id of the peripheral to connect to.
     * @param {?number} baudrate - the baudrate.
     */
    connect(id, baudrate = null) {
        const config = Object.assign({}, this.serialConfig);
        if (baudrate) {
            config.baudRate = baudrate;
        }
        if (this._WiFi) {
            this._WiFi.connectPeripheral(id, { config: config });
        }
    }

    /**
     * Disconnect from the peripheral.
     */
    disconnect() {
        if (this._WiFi) {
            this._WiFi.disconnect();
        }

        this.reset();
    }

    /**
     * Reset all the state and timeout/interval ids.
     */
    reset() {
    }

    /**
     * Return true if connected to the peripheral.
     * @return {boolean} - whether the peripheral is connected.
     */
    isConnected() {
        let connected = false;
        if (this._WiFi) {
            connected = this._WiFi.isConnected();
        }
        return connected;
    }

    /**
     * Set baudrate of the peripheral WiFi.
     * @param {number} baudrate - the baudrate.
     */
    setBaudrate(baudrate) {
        this._WiFi.setBaudrate(baudrate);
    }

    /**
     * Write data to the peripheral WiFi.
     * @param {string} data - the data to write.
     */
    write(data) {
        if (!this.isConnected()) return;

        const base64Str = Buffer.from(data).toString('base64');
        this._WiFi.write(base64Str, 'base64');
    }

    /**
     * Send a message to the peripheral WiFi socket.
     * @param {Uint8Array} message - the message to write
     */
    send(message) {
        if (!this.isConnected()) return;
        const data = Base64Util.uint8ArrayToBase64(message);
        this._WiFi.write(data, 'base64');
    }

    /**
     * Starts reading data from peripheral after WiFi has connected to it.
     * @private
     */
    _onConnect() {
        this._WiFi.read(this._onMessage);
    }

    /**
     * Process the sensor data from the incoming WiFi characteristic.
     * @param {object} base64 - the incoming WiFi data.
     * @private
     */
    _onMessage(base64, type) {
        const consoleData = Buffer.from(base64, 'base64');
        // MARK consoleData should add in other peripheral
        const data = {
            'deviceId': this._deviceId,
            'type': type,
            'value': consoleData,
        }
        this._runtime.emit(this._runtime.constructor.PERIPHERAL_RECIVE_DATA, data);
    }
}

module.exports = LoongsonPeripheral;
