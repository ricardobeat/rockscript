# GUI setup
# ============
window.gui = new dat.GUI()

window.PedalBoard = new EventEmitter

# Audio
# ============

context = new AudioContext
anal    = context.createAnalyser()

tuna = new Tuna context

gain = context.createGainNode()
gain.gain.value = 6

# Overdrive pedal
# ===============

window.OVERDRIVES = {}
window.createOverdrive = (name, opts) ->
    options =
        outputGain     : .7       # 0 to 1+
        drive          : 1        # 0 to 1
        curveAmount    : 0.7      # 0 to 1
        algorithmIndex : 0        # 0 to 5, selects one of our drive algorithms
        bypass         : 0
    extend options, opts
    OVERDRIVES[name] = new tuna.Overdrive options
    OVERDRIVES[name]._name = name
    if stored_options = OVERDRIVES["options_#{name}"]
        extend stored_options, options
     else
        OVERDRIVES["options_#{name}"] = options

updateOverdrive = (name) ->
    unless typeof name is 'string'
        name = OVERDRIVES.current._name
    createOverdrive name, OVERDRIVES["options_#{name}"]
    OVERDRIVES.set name

OVERDRIVES.set = (overdrive) ->
    if typeof overdrive is 'string'
        overdrive = OVERDRIVES[overdrive]
    chain.replace OVERDRIVES.current, overdrive
    OVERDRIVES.current = overdrive

for name, i in 'ABCDE'

    options = { algorithmIndex: i }

    # load saved preset 
    if saved = gui.load?.remembered?[gui.preset][i]
        extend options, saved

    createOverdrive name, options
    options = OVERDRIVES["options_#{name}"]
    gui.remember options

    using new EffectControl("Overdrive #{name}", options, updateOverdrive), ->
        @add 'outputGain', 0, 1
        @add 'drive', 0, 1
        @add 'curveAmount', 0, 1

OVERDRIVES.current = OVERDRIVES.A

# Delay pedal
# ===============

DELAY_OPTIONS = 
    feedback: 0.6     # 0 to 1+
    delayTime: 150    # how many milliseconds should the wet signal be delayed? 
    wetLevel: .8       # 0 to 1+
    dryLevel: .5      # 0 to 1+
    cutoff: 8000      # cutoff frequency of the built in highpass-filter. 20 to 22050
    bypass: 0

delay = new tuna.Delay DELAY_OPTIONS

updateDelay = ->
    chain.replace delay, new tuna.Delay DELAY_OPTIONS

using new EffectControl("Delay", DELAY_OPTIONS, updateDelay), ->
    @add 'feedback', 0, 1
    @add 'delayTime', 0, 1000
    @add 'wetLevel', 0, 1
    @add 'dryLevel', 0, 1
    @add 'cutoff', 20, 22050

# Tremolo pedal
# ===============

TREMOLO_OPTIONS =
    intensity: 0.3     #0 to 1
    rate: 0.1          #0.001 to 8
    stereoPhase: 0     #0 to 180
    bypass: 0

tremolo = new tuna.Tremolo TREMOLO_OPTIONS

updateTremolo = ->
    chain.replace tremolo, new tuna.Tremolo TREMOLO_OPTIONS

using new EffectControl("Tremolo", TREMOLO_OPTIONS, updateTremolo), ->
    @add 'intensity', 0, 1
    @add 'rate', 0, 8
    @add 'stereoPhase', 0, 180

# Main event emitter
# ==================

setupEvents = ->
    effects =
        overdrive : chain.indexOf OVERDRIVES.current
        delay     : chain.indexOf delay
        tremolo   : chain.indexOf tremolo

    @on 'toggle', (name, state) ->
        chain.toggle effects[name]

    @on 'distortion', (type) ->
        OVERDRIVES.set type

# Create effects chain and UI after user authorizes getUserMedia
init = (input) ->
    source = context.createMediaStreamSource input
    window.chain = new AudioChain [
        source
        anal
        gain
        OVERDRIVES.current
        delay
        tremolo
        context.destination
    ]

    chain.link()

    UI.createSwitch 'Overdrive', chain.indexOf OVERDRIVES.current
    UI.createDistortionSelector OVERDRIVES.current
    UI.createSwitch 'Delay', chain.indexOf delay
    UI.createSwitch 'Tremolo', chain.indexOf tremolo

    s = new SpectrumVisualizer anal, 'meter'
    s.run()

    using PedalBoard, setupEvents

# Ask for permission
navigator.getUserMedia { audio: true }, init
