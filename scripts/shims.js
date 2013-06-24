;(function(){

    // API fallbacks
    // =============

    window.requestAnimationFrame || (window.requestAnimationFrame =
        window.mozRequestAnimationFrame    ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame     ||
        window.oRequestAnimationFrame      ||
        function (fn) { setTimeout(fn, 1000/60) }
    )

    window.AudioContext || (window.AudioContext =
        window.webkitAudioContext ||
        window.mozAudioContext    ||
        window.msAudioContext     ||
        window.oAudioContext
    )

    navigator.getUserMedia || (navigator.getUserMedia =
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia    ||
        navigator.msGetUserMedia     ||
        navigator.oGetUserMedia
    )

})();