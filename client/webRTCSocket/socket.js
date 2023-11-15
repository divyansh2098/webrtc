import { io } from 'socket.io-client'
class RTConnection {
    constructor() {
        this.config = {
            iceServers: [
                {
                    urls: ["stun:stun.l.google.com:19302"]
                }
            ]
        }
        this.connections = {}
        this.videoElements = {}
        this.ICEqueue = {}
    }

    init = async (roomId, videoElemRef) => {
        this.roomId = roomId
        this.videoElemRef = videoElemRef.current
        let video = document.createElement('VIDEO')
        this.myVideo = video
        video.onloadedmetadata = e => video.play()
        this.videoElemRef.appendChild(video)
        const stream = await navigator.mediaDevices.getUserMedia({video: {
            height: 720,
            width: 1280
        }, audio: false})
        video.srcObject = stream
        this.socket = io()
        
        this.socket.emit("join-room", roomId)
        
        this.socket.on('new-member', id => {
            console.log("Yes Received new Candidate")
            this.createOffer(id)
        })

        this.socket.on("offer", (id, offer) => {
            this.acceptOffer(id, offer)
        })

        this.socket.on("new-ice-candidate", (id, candidate) => {
            this.handleIceCandidate(id, candidate)
        })

        this.socket.on("answer", (id, answer) => {
            this.acceptAnswer(id, answer)
        })

        this.socket.on("leaveCall", id => {
            this.handlePeerDisconnection(id)
        })
    }

    handlePeerDisconnection = (id) => {
        this.connections[id].close()
        delete this.connections[id]
        const stream = this.videoElements[id].srcObject
        stream.getTracks().forEach(track => track.stop())
        this.videoElemRef.removeChild(this.videoElements[id])
        delete this.videoElements[id]
    }

    acceptAnswer = async (id, answer) => {
        const peerConnection = this.connections[id]
        try {
            await peerConnection.setRemoteDescription(answer)
            console.log(peerConnection)
        } catch(err) {
            console.log(err)
        }
        console.log("Answer Accepted")
    }

    handleIceCandidate = async (id, candidate) => {
        if(!candidate) {
            return
        }

        const peerConnection = this.connections[id]

        if(peerConnection && peerConnection.remoteDescription) {
            console.log("Setting Ice")
            console.log(candidate)
            try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            } catch(err) {
                console.log(err)
            }
        } else {
            if(id in this.ICEqueue) {
                console.log("Storing Ice Candidates")
                console.log(id)
                this.ICEqueue[id].push(candidate)
            } else {
                this.ICEqueue[id] = [candidate]
            }
        }
    }

    hydrateIceCandidates = async (id) => {
        const peerConnection = this.connections[id]
        console.log("Hydrating Ice")
        for(let i in this.ICEqueue[id]) {
            const candidate = this.ICEqueue[id][i]
            try {
                await peerConnection.addIceCandidate(candidate)
            } catch(err) {
                console.log(err)
            }
        }
    }

    acceptOffer = async (id, offer) => {
        const peerConnection = new RTCPeerConnection(this.config)
        this.connections[id] = peerConnection
        peerConnection.onicecandidate = e => {
            this.socket.emit("new-ice-candidate", e.candidate)
        }
        peerConnection.ontrack = (e) => {
            console.log("Received a track");
            console.log(e.streams)
            const video = document.createElement('VIDEO')
            this.videoElemRef.appendChild(video)
            this.videoElements[id] = video
            video.onloadeddata = ev => {console.log("Meta Data Loaded") ; video.play()}
            video.srcObject = e.streams[0]
        }
        peerConnection.ondatachannel = e => {
            console.log("Data Channel Received")
            peerConnection.dc = e.channel
            peerConnection.dc.onopen = e => console.log("Connected!!!!")
        }
        
        const stream = this.myVideo.srcObject
        console.log("Private Stream")
        console.log(stream)
        try {
            await stream.getTracks().forEach(async track => peerConnection.addTrack(track, stream))
        } catch(err) {
            console.log(err)
        }
        try {
            await peerConnection.setRemoteDescription(offer)
        } catch(err) {
            console.log(err)
        }
        console.log("Remote Description Set")
        try {
            const ans = await peerConnection.createAnswer()
            await peerConnection.setLocalDescription(ans)
            this.socket.emit("answer", id, ans)
        } catch(err) {
            console.log(err)
        }
        console.log("Answer Created")
        console.log("Local Description Set")
        try {
            await this.hydrateIceCandidates(id)
        } catch(err) {
            console.log(err)
        }
    }

    createOffer = async (id) => {
        const peerConnection = new RTCPeerConnection(this.config)
        this.connections[id] = peerConnection
        peerConnection.ontrack = (e) => {
            console.log("Received a track");
            console.log(e.streams)
            const video = document.createElement('VIDEO')
            console.log("Video Element")
            console.log(video)
            this.videoElemRef.appendChild(video)
            this.videoElements[id] = video
            video.onloadedmetadata = ev => video.play()
            video.srcObject = e.streams[0]
        }
        peerConnection.onicecandidate = (e) => {
            this.socket.emit("new-ice-candidate", e.candidate)
        }
        peerConnection.dc = peerConnection.createDataChannel("channel")
        peerConnection.dc.onopen = e => {
            console.log("Connected!!!")
        }
        const stream = this.myVideo.srcObject
        try {
            await stream.getTracks().forEach(async track => peerConnection.addTrack(track, stream))
        } catch(err) {
            console.log(err)
        }
        try {
            const offer = await peerConnection.createOffer()
            await peerConnection.setLocalDescription(offer)
            this.socket.emit("offer", id, offer)
        } catch(err) {
            console.log(err)
        }
        console.log(peerConnection.localDescription)
    }

    stopStream = (stream, elem) => {
        stream.getTracks().forEach(track => {
            track.stop()
        })
        console.log(elem)
        console.log(this.videoElemRef)
        this.videoElemRef.removeChild(elem)
    }

    cleanMedia = () => {
        this.stopStream(this.myVideo.srcObject, this.myVideo)
        for(let id in this.videoElements) {
            this.stopStream(this.videoElements[id].srcObject, this.videoElements[id])
            delete this.videoElements[id]
        }
        delete this.videoElements
    }

    leaveCall = () => {
        for(let id in this.connections) {
            this.connections[id].close()
            delete this.connections[id]
        }
        delete this.connections
        this.cleanMedia()
        this.socket.disconnect()
    }
}

export default RTConnection