import {useEffect, useState} from "react";
import {Appbar} from "../components/Appbar.tsx";

export function Sender(){

    const [socket,set]=useState<null|WebSocket>(null);
    useEffect(()=>{
        const socket=new WebSocket("ws://localhost:3000");
        set(socket);
        socket.onopen=()=>{
            socket.send(JSON.stringify({type:'sender'}))
        }

    },[]);
    return(
        <div className='w-full h-screen'>
            <Appbar/>
            <div className='flex justify-center items-center w-full h-fit'>
            <button className='bg-green-600 rounded p-2 text-white' onClick={async ()=>{
                const pc=new RTCPeerConnection();
                pc.ontrack=async (event)=>{
                    console.log(event)
                    const video=document.createElement('video');
                    document.body.appendChild(video);
                    video.srcObject=new MediaStream([event.track]);
                    video.muted=true;
                    await video.play();
                }
                const stream=await navigator.mediaDevices.getUserMedia({video:true});
                pc.addTrack(stream.getVideoTracks()[0]);
                pc.onnegotiationneeded=async ()=> {
                    const offer=await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    socket?.send(JSON.stringify({type:'offer', sdp:pc.localDescription}));
                }
                pc.onicecandidate=(ev)=> {
                    if(ev.candidate){
                        socket?.send(JSON.stringify({type:'icecandidate',candidate:ev.candidate}));
                    }
                }
                if(socket!==null){
                socket.onmessage=async (data)=>{
                    const message=JSON.parse(data.data);
                    if(message.type==='answer'){
                        console.log("answer")
                        await pc.setRemoteDescription(message.sdp);
                    }
                    if(message.type==='icecandidate'){
                        await pc.addIceCandidate(message.candidate)
                    }
                }

                }
           }}>Send video</button>
        </div>
        </div>
    )
}