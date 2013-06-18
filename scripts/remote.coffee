# Remote client
# =============

socket = io.connect()

$ = (selector) -> document.querySelector selector
$$ = (selector) -> document.querySelectorAll selector

states = {}
lastChange = {}

['overdrive', 'delay', 'tremolo'].forEach (effect) ->
    states[effect] = true
    $('#'+effect).addEventListener 'touchstart', (e) ->
        return if Date.now() - lastChange[effect] < 100
        state = states[effect] = !states[effect]
        e.target.className = ['off', 'on'][+state]
        socket.emit 'toggle', effect, state
        lastChange[effect] = Date.now()

document.ontouchmove = (e) -> e.preventDefault()

buttons = $$('.distortion button')

updateDistortionState = (type) ->
    for button in buttons
        button.className = ['off', 'on'][+(button.id is 'distortion_'+type)]

updateDistortionState 'A'

['A', 'B', 'C', 'D', 'E'].forEach (type) ->
    $("#distortion_#{type}").addEventListener 'touchstart', (e) ->
        updateDistortionState type
        socket.emit 'distortion', type