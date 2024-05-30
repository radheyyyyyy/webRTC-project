"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const wss = new ws_1.WebSocketServer({ port: 3000 });
let senderSocket = null;
let receiverSocket = null;
wss.on('connection', (ws) => {
    ws.on('error', console.error);
    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'sender') {
            senderSocket = ws;
        }
        else if (message.type === 'receiver') {
            receiverSocket = ws;
        }
        else if (message.type === 'offer') {
            receiverSocket === null || receiverSocket === void 0 ? void 0 : receiverSocket.send(JSON.stringify({ type: 'offer', sdp: message.sdp }));
        }
        else if (message.type === 'answer') {
            senderSocket === null || senderSocket === void 0 ? void 0 : senderSocket.send(JSON.stringify({ type: 'answer', sdp: message.sdp }));
        }
        else if (message.type === 'icecandidate') {
            if (ws === senderSocket) {
                receiverSocket.send(JSON.stringify({ type: 'icecandidate', candidate: message.candidate }));
            }
            else if (ws === receiverSocket) {
                senderSocket.send(JSON.stringify({ type: 'icecandidate', candidate: message.candidate }));
            }
        }
    });
});
