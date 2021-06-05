import { io } from 'socket.io-client'
class RTConnection {
    constructor(roomId) {
        this.socket = io()
        this.config = {
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302"]
                }
            ]
        }
        this.connections = {}
        this.roomId = roomId
    }

    init = (roomId, videoElemRef) => {
        this.roomId = roomId
        this.videoElemRef = videoElemRef
        navigator.mediaDevices.getUserMedia({
            video: {
                width: 1280,
                height: 1024
            },
            audio: false
        }).then((stream) => {
            let videoEl = document.createElement('VIDEO')
            videoEl.srcObject = stream
            videoEl.onloadedmetadata = () => { videoEl.play() }
            videoElemRef.current.appendChild(videoEl)
        })
        this.socket.emit("join-room", this.roomId)

        this.socket.on("new-member", (id) => {
            this.createOffer(id)
        })

        this.socket.on("new-ice-candidate", (id, candidate) => {
            this.updateIceCandidates(id, candidate)
        })

        this.socket.on("offer", (id, offer) => {
            this.acceptOffer(id, offer)
        })

        this.socket.on("answer", (id, answer) => {
            this.acceptAnswer(id, answer)
        })
    }

    acceptAnswer = (id, answer) => {
        this.connections[id].setRemoteDescription(answer)
        .then(e => {
            console.log("Answer Accepted")
        })
    }

    updateIceCandidates = (id, candidate) => {
        if(candidate) {
            this.connections[id].addIceCandidate( new RTCIceCandidate(candidate) )
        }
    }

    acceptOffer = (id, offer) => {
        const peerConnection = new RTCPeerConnection(this.config)
        this.connections[id] = peerConnection
        peerConnection.ondatachannel = (e) => {
            peerConnection.dataChannel = e.channel    
            peerConnection.dataChannel.onmessage = (e) => {
                console.log("Received new Message from Peer " + e.data)
            }
            peerConnection.dataChannel.onopen = (e) => {
                console.log("Connection Opened!!")
            }
        }
        
        peerConnection.setRemoteDescription(offer)
        .then(() => {
            console.log("Remote Description Set")
        })

        peerConnection.createAnswer()
        .then(a => {
            peerConnection.setLocalDescription(a)
            this.socket.emit("answer", id, a)
        })
        .then(() => {
            console.log("Answer Sent")
        })
    }

    createOffer = (id) => {
        const peerConnection = new RTCPeerConnection(this.config)
        this.connections[id] = peerConnection
        peerConnection.onicecandidate = e => {
            this.socket.emit("new-ice-candidate", e.candidate)
        }
        const dataChannel = peerConnection.createDataChannel("channel")
        dataChannel.onmessage = (e) => {
            console.log("Received new message from Peer " + e.data)   
        }
        dataChannel.onopen = (e) => {
            console.log("Connection Opened!!")
        }
        peerConnection.createOffer()
        .then(o => peerConnection.setLocalDescription(o))
        .then(e => {
            this.socket.emit("offer", id, peerConnection.localDescription)
        })
    }
}

export default RTConnection