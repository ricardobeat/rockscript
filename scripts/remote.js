(function(){

    var socket = io.connect()
      , remote = new EventEmitter
      , UI     = new RockScriptUI('.switches', remote)

    document.ontouchmove = function (e) {
        e.preventDefault()
    }

    remote.on('toggleSwitch', function(name, state, own){
        if (own) return
        socket.emit('toggleSwitch', name, state)
    })

    socket.on('toggleSwitch', function(name, state){
        remote.emit('toggleSwitch', name, state, true)
    })

    ;['tremolo', 'overdrive', 'chorus', 'phaser', 'delay'].forEach(function(effect, i){
        UI.createSwitch(effect, i+2)
    })

})()