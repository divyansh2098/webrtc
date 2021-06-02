const socket = io()
socket.on("connect", () => {
    console.log(socket.id)
})
let peerConnections = {}

const videoEl = document.getElementById("video-elem")
navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
    audio: false
}).then(stream => {
    videoEl.srcObject = stream
    videoEl.onloadedmetadata = (e) => {videoEl.play()}
})

socket.on("watch", (id) => {
    const peerConnection = new RTCPeerConnection()
    let stream = videoEl.srcObject
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream))
    peerConnections[id] = peerConnection
    const dataChannel = peerConnection.createDataChannel("channel")
    dataChannel.onopen = e => {console.log("Data Channel Opened");}
    dataChannel.onmessage = e => console.log("New Message from peer " + e.data)
    peerConnection.onicecandidate = e => {
        socket.emit("new-broadcast-candidate", e.candidate)
    }
    peerConnection.createOffer().then(o => peerConnection.setLocalDescription(o)).then(e => {
        window.broadcaster = dataChannel
        socket.emit("offer", id, peerConnection.localDescription)
    })
    peerConnection.ontrack = (e) => {
        console.log("Coming Here")
        const remoteVideoEl = document.getElementById("remote-elem")
        remoteVideoEl.srcObject = e.streams[0]
        remoteVideoEl.onloadedmetadata = (e) => remoteVideoEl.play()
    }
})

socket.on("new-watcher-candidate", (id,candidate) => {
    if(candidate) {
        peerConnections[id].addIceCandidate( new RTCIceCandidate(candidate))
    }
})

socket.on("answer", (id, ans) => {
    peerConnections[id].setRemoteDescription(ans)
})

socket.on("offer", offer => {
    const watcherConnection = new RTCPeerConnection()
    watcherConnection.ondatachannel = e => {
        watcherConnection.dc = e.channel
        watcherConnection.dc.onopen = e => console.log("Connection now opened!!!")
        watcherConnection.dc.onmessage = e => console.log("New message from peer " + e.data)
    }
    watcherConnection.setRemoteDescription(offer).then(e => console.log("Remote Description set"))
    watcherConnection.onicecandidate = e => {
        socket.emit("new-watcher-candidate", e.candidate)
    }

    videoEl.onloadeddata = () => {
        const stream = videoEl.srcObject
        console.log("Sending Stream")
        stream.getTracks().forEach(track => watcherConnection.addTrack(track, stream))
        watcherConnection.createAnswer().then(a => {
            watcherConnection.setLocalDescription(a)
            socket.emit("answer", a)
        }).then(e => {
            console.log("Answer sent")
            window.watcherConnection = watcherConnection
        })
    }
    watcherConnection.ontrack = (e) => {
        const remoteVideoEl = document.getElementById("remote-elem")
        remoteVideoEl.srcObject = e.streams[0]
        remoteVideoEl.onloadedmetadata = (e) => remoteVideoEl.play()
    }
})