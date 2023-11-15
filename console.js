// Peer 1
const lc = new RTCPeerConnection()
const dataChannel = lc.createDataChannel("channel")
lc.onicecandidate = e => { console.log("Got new Ice Candidate" + JSON.stringify(lc.localDescription)) }
dataChannel.onopen = e => { console.log("Channel Opened") }
dataChannel.onmessage = e => { console.log("Got a message: " + e.data) }
lc.createOffer().then(o => lc.setLocalDescription(o)).then(e => console.log("Local Description Set"))
lc.setRemoteDescription(answer).then(e => { console.log("Remote Set") })

// Peer 2
const rc = new RTCPeerConnection()
rc.ondatachannel = e => { rc.dc = e.channel; rc.dc.onmessage = (e) => {console.log("Got new message: " + e.data)}; rc.dc.onopen = () => { console.log("Connection Opened!!") }  }
rc.setRemoteDescription(offer).then(() => { console.log("offer set") })
rc.onicecandidate = e => { console.log("Got new Ice Candidate: " + JSON.stringify(rc.localDescription)) }
rc.createAnswer().then(a => { rc.setLocalDescription(a) }).then(() => {console.log("Answer Created")})
