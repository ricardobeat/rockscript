var http     = require('http')
  , fs       = require('fs')
  , express  = require('express')
  , socketio = require('socket.io')

var app    = express()
  , server = http.createServer(app)

app.use(express.static(__dirname))

// Serve static pages
// -------------------

app.get('/screen', function (req, res) {
    fs.createReadStream('screen.html').pipe(res)
})

app.get('/remote', function (req, res) {
    fs.createReadStream('remote.html').pipe(res)
})

app.get('/wah', function (req, res) {
    fs.createReadStream('wah.html').pipe(res)
})

// Websockets
// -----------

var io = socketio.listen(server)
  , effects = {}

io.sockets.on('connection', function (socket) {

    socket.on('toggleSwitch', function (name, state) {
        socket.broadcast.emit('toggleSwitch', name, state)
    })

    socket.on('wah', function (ratio) {
        socket.broadcast.emit('wah', ratio)
    })
})

server.listen(8000)