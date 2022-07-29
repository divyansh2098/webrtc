const express = require('express')
const fs = require('fs')
const app = express()
const path = require('path')
const v4 = require('uuid').v4

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}

const server = require('http').createServer(app)
const io = require('socket.io')(server)
const port = process.env.port || '5000'

app.set('view engine', 'ejs')

app.use("/",express.static(path.resolve(__dirname + '/public')))

app.get('/',(req, res) => {
    res.render('home')   
})

app.get('/room', (req,res) => {
    const roomId = v4()
    res.redirect(`/room/${roomId}`)
})

app.get('/room/:roomId',(req, res) => {
    res.render('room', {roomId: req.params.roomId})
})

server.listen(port, () => {
    console.log(`Starting server on ${port}`)
})

io.on("connection", socket => {
    socket.on('join-room', (roomId) => {
        socket.join(roomId)
        socket.to(roomId).emit("new-member", socket.id)
        
        socket.on("new-ice-candidate", (candidate) => {
            socket.to(roomId).emit("new-ice-candidate", socket.id, candidate)
        })

        socket.on("offer", (id, offer) => {
            socket.to(id).emit("offer", socket.id, offer)          
        })

        socket.on("answer", (id, answer) => {
            socket.to(id).emit("answer", socket.id, answer)
        })

        socket.on("disconnecting", () => {
            for(let room of socket.rooms) {
                socket.to(room).emit("leaveCall", socket.id)
            }
        })
    })  
})