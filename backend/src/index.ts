import {WebSocketServer,WebSocket} from "ws";

const wss=new WebSocketServer({port:3000});
let senderSocket:any=null;
let receiverSocket:any=null;

wss.on('connection',(ws)=>{
    ws.on('error',console.error);
    ws.on('message',(data:any)=>{
        const message=JSON.parse(data);
        if(message.type==='sender'){
            senderSocket=ws;
        }
        else if(message.type==='receiver')
        {
            receiverSocket=ws;
        }
        else if(message.type==='offer'){
            receiverSocket.send(JSON.stringify({type:'offer',sdp:message.sdp}));
        }
        else if(message.type==='answer'){
            senderSocket.send(JSON.stringify({type:'answer',sdp:message.sdp}));
        }
        else if(message.type==='icecandidate'){
            if(ws===senderSocket){
                receiverSocket.send(JSON.stringify({type:'icecandidate',candidate:message.candidate}));
            }
            else if(ws===receiverSocket){
                senderSocket.send(JSON.stringify({type:'icecandidate',candidate:message.candidate}));
            }
        }
    })
})