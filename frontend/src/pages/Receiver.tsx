import {useEffect} from "react";
import {Appbar} from "../components/Appbar.tsx";

export function Receiver(){
    useEffect(()=>{

        const pc=new RTCPeerConnection();
        const socket=new WebSocket('ws://localhost:3000');

        pc.ontrack=async (event)=>{
            console.log(event)
            const video=document.createElement('video');
            document.body.appendChild(video);
            video.srcObject=new MediaStream([event.track]);
            video.muted=true;
            await video.play();
        }
        socket.onopen=()=>{
            socket.send(JSON.stringify({type:'receiver'}));
        }
        socket.onmessage= async (data)=>{
            const stream=await navigator.mediaDevices.getUserMedia({video:true});
            pc.addTrack(stream.getVideoTracks()[0]);
            const message=JSON.parse(data.data);
            if(message.type==='icecandidate'){
                await pc.addIceCandidate(message.candidate)
            }
            if(message.type==='offer'){
                await pc.setRemoteDescription(message.sdp)
                const answer=await pc.createAnswer();
                await pc.setLocalDescription(answer);
                socket.send(JSON.stringify({type:'answer',sdp:pc.localDescription}))
            }
        }
        pc.onicecandidate=(ev)=>{
            if(ev.candidate){
                socket.send(JSON.stringify({type:'icecandidate',candidate:ev.candidate}));
            }
        }
    },[])
    return(
        <div>
            <Appbar/>
            <div className='text-black text-2xl ml-[45%] mt-10 font-extrabold mb-10'>Receiver-side</div>
        </div>
    )
}