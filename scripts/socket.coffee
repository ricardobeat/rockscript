# Host
# =============

socket = io.connect()

socket.on 'toggle', (effect, state) ->
    console.log 'toggle', effect, state
    PedalBoard.emit 'toggle', effect, state

socket.on 'distortion', (type) ->
    console.log 'select distortion', type
    PedalBoard.emit 'distortion', type