http     = require 'http'
fs       = require 'fs'
express  = require 'express'
socketio = require 'socket.io'

app    = express()
server = http.createServer app

app.configure ->
    app.use express.static __dirname

app.get '/', (req, res) ->
    fs.createReadStream('index.html').pipe res

app.get '/remote', (req, res) ->
    fs.createReadStream('remote.html').pipe res

io = socketio.listen server

io.sockets.on 'connection', (socket) ->
    socket.on 'toggle', (ev, state) ->
        console.log 'toggle', ev, state
        socket.broadcast.emit 'toggle', ev, state

    socket.on 'distortion', (type) ->
        console.log 'select distortion', type
        socket.broadcast.emit 'distortion', type

server.listen 8000