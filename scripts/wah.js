(function(){

    var socket = io.connect()

    document.ontouchmove = function (e) {
        e.preventDefault()
    }

    var lastEvent = 0

    window.ondevicemotion = function(event) {
        var now = Date.now()
        if (now - lastEvent < 100) return
        lastEvent = now

        var ratio = Math.max(0, Math.min(10, Math.abs(event.accelerationIncludingGravity.y)))
        socket.emit('wah', ratio.toFixed(2))
    }

})()