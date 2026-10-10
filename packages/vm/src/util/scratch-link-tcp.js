/**
 * This class provides a ScratchLinkSocket implementation using WebSockets,
 * attempting to connect with the locally installed Scratch-Link.
 *
 * To connect with ScratchLink without WebSockets, you must implement all of the
 * public methods in this class.
 * - open()
 * - close()
 * - setOn[Open|Close|Error]
 * - setHandleMessage
 * - sendMessage(msgObj)
 * - isOpen()
 */
const net = require('net');

class ScratchLinkTCP {
    constructor(type) {
        this._type = type;
        this._onOpen = null;
        this._onClose = null;
        this._onError = null;
        this._handleMessage = null;
        this._tcp = null;
    }

    open(ip = null) {
        console.log('open', ip);
        let addr = null;
        // 目前使用ws协议
        // if (ip == null) {
        //     addr = 'ws://ls2k.local:8081'; // loongson dns、
        // }else{
        //     addr = `ws://${ip}:20111`;
        // }
        addr = "192.168.8.129";
        

        // 绑定回调函数
        if (this._onOpen && this._onClose && this._onError && this._handleMessage) {
            this._tcp = net.connect(8081, addr, this._onOpen);
            this._tcp.on('data', this._onMessage)
            this._tcp.on('error', this._onError)
            this._tcp.on('close', this._onClose)    
        } else {
            throw new Error('Must set open, close, message and error handlers before calling open on the socket');
        }

        // this._ws.onmessage = this._onMessage.bind(this);
    }

    close() {
        // this._ws.close();
        // this._ws = null;
        this._tcp.close();
        this._tcp = null;
    }

    sendMessage(message) {
        const messageText = JSON.stringify(message);
        // console.log("sendMessage", messageText);
        this._tcp.write(messageText)
        // this._ws.send(messageText);
    }

    setOnOpen(fn) {
        this._onOpen = fn;
    }

    setOnClose(fn) {
        this._onClose = fn;
    }

    setOnError(fn) {
        this._onError = fn;
    }

    setHandleMessage(fn) {
        this._handleMessage = fn;
    }

    isOpen() {
        // return this._ws && this._ws.readyState === this._ws.OPEN;
        return this._tcp.readyState == 'open';
    }

    _onMessage(e) {
        console.log("onMessage", e.data);
        const json = JSON.parse(e.data);
        this._handleMessage(json);
    }
}

module.exports = ScratchLinkTCP;
