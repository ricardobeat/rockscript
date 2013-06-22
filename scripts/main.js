;(function(){

    window.RockScript = new EventEmitter

    // Audio
    // ============

    var context = new AudioContext
      , anal    = context.createAnalyser()
      , tuna    = new Tuna(context)
      , gain    = context.createGainNode()
      , effects = RockScript.effects = {}

    gain.gain.value = 6

    // Effect nodes
    // -------------

    effects.overdrive = new tuna.Overdrive({
        outputGain     : .3  // 0 to 1+
      , drive          : 0.6   // 0 to 1
      , curveAmount    : 0.35 // 0 to 1
      , algorithmIndex : 2  // 0 to 5, selects one of our drive algorithms
      , bypass         : 1
    })

    effects.delay = new tuna.Delay({
        feedback: 0.5  // 0 to 1+
      , delayTime: 300 // how many milliseconds should the wet signal be delayed? 
      , wetLevel: .9   // 0 to 1+
      , dryLevel: .7   // 0 to 1+
      , cutoff: 15000   // cutoff frequency of the built in highpass-filter. 20 to 22050
      , bypass: 1
    })

    effects.tremolo = new tuna.Tremolo({
        intensity   : 0.4 // 0 to 1
      , rate        : 5 // 0.001 to 8
      , stereoPhase : 30   // 0 to 180
      , bypass      : 1
    })

    effects.chorus = new tuna.Chorus({
        rate: 1.5
      , feedback: 0.2
      , delay: 0.0045
      , bypass: 1
    })

    effects.phaser = new tuna.Phaser({
        rate: 5.2                     // 0.01 to 8 is a decent range, but higher values are possible
      , depth: 0.3                    // 0 to 1
      , feedback: 0.2                 // 0 to 1+
      , stereoPhase: 30               // 0 to 180
      , baseModulationFrequency: 700  // 500 to 1500
      , bypass: 1
    })

    effects.wah = new tuna.WahWah({
        automode: false     // true/false
      , baseFrequency: 0.5  // 0 to 1
      , excursionOctaves: 2 // 1 to 6
      , sweep: 0.2          // 0 to 1
      , resonance: 10       // 1 to 100
      , sensitivity: 0.5    // -1 to 1
      , bypass: 1
    })

    var compressor = new tuna.Compressor({
        threshold: 0.5    // -100 to 0
      , makeupGain: 1     // 0 and up
      , attack: 1         // 0 to 1000
      , release: 0        // 0 to 3000
      , ratio: 4          // 1 to 20
      , knee: 5           // 0 to 40
      , automakeup: true  // true/false
      , bypass: 0
    })

    var cabinet = new tuna.Cabinet({
        makeupGain: 1                              // 0 to 20
      , impulsePath: "impulses/impulse_guitar.wav" // path to your speaker impulse
      //, impulsePath: "impulses/wildecho.wav" // path to your speaker impulse
      , bypass: 0
    })

    // Create effects chain and UI after user authorizes getUserMedia
    function init (input) {
        // get source stream
        var source = context.createMediaStreamSource(input)

        // create node chain
        var chain = RockScript.Chain = [
            compressor
          , gain
          , effects.tremolo
          , effects.overdrive
          , effects.chorus
          , effects.phaser
          , effects.delay
          , effects.wah
          , anal
          , cabinet
          , context.destination
        ]

        chain.reduce(function(prev, current, i){
            prev.connect(current.input || current)
            return current
        }, source)

        var UI = new RockScriptUI('.switches', RockScript)

        for (var effect in effects) {
            var node = effects[effect]
            node.chainIndex = chain.indexOf(node)
            UI.createSwitch(effect, node.chainIndex)
        }

        // set noise floor
        anal.minDecibels = -65

        var visualizer = new SpaceViz(anal)
        visualizer.run()

        RockScript.on('toggleSwitch', function (name, active) {
            effects[name].bypass = +!active
        })

        socket = io.connect()

        RockScript.on('toggleSwitch', function(name, state, own){
            if (own) return
            socket.emit('toggleSwitch', name, state)
        })

        socket.on('toggleSwitch', function(name, state){
            RockScript.emit('toggleSwitch', name, state, true)
        })

        socket.on('wah', function (value) {
            effects.wah.baseFrequency = value / 10
        })
    }

    // Ask for user permission
    navigator.getUserMedia({ audio: true }, init, function (err) {
        console.error(err)
    })

})();
