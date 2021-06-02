const express = require('express')
const fs = require('fs')
const app = express()

const options = {
    key: fs.readFileSync("key.pem"),
    cert: fs.readFileSync("cert.pem")
}

const server = require('https').createServer(options,app)
const io = require('socket.io')(server)
const port = process.env.port || '5000'

app.set('view engine', 'ejs')

app.use(express.static('public'))

app.get('/',(req, res) => {
    res.render('home', {name: "Divyansh Singh"})   
})

server.listen(port, () => {
    console.log(`Starting server on ${port}`)
})

let broadcaster = null
io.on("connection", socket => {
    console.log(broadcaster)
    if(broadcaster) {
        socket.to(broadcaster).emit("watch", socket.id)
    } else {
        broadcaster = socket.id
    }
    socket.on("new-broadcast-candidate",(candidate) => {
        socket.broadcast.emit("new-broadcast-candidate", candidate)
    })

    socket.on("offer", (id,sdp) => {
        socket.to(id).emit("offer", sdp)
    })

    socket.on("new-watcher-candidate", candidate => {
        socket.to(broadcaster).emit("new-watcher-candidate", socket.id,candidate)
    }) 
    
    socket.on("answer", a => {
        socket.to(broadcaster).emit("answer", socket.id,a)
    })
})