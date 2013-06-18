
# API fallbacks
# =============

window.requestAnimationFrame or= (
    window.mozRequestAnimationFrame    or
    window.webkitRequestAnimationFrame or
    window.msRequestAnimationFrame     or
    window.oRequestAnimationFrame      or
    (fn) -> setTimeout(fn, 1000/60)
)

window.AudioContext or= (
    window.webkitAudioContext or
    window.mozAudioContext    or
    window.msAudioContext     or
    window.oAudioContext
)

navigator.getUserMedia or= (
    navigator.webkitGetUserMedia or
    navigator.mozGetUserMedia    or
    navigator.msGetUserMedia     or
    navigator.oGetUserMedia
)

window.using = (context, fn) ->
    fn.call context

window.extend = (dest, source) ->
    for own key, val of source
        dest[key] = val
    return dest

window.EventEmitter = class EventEmitter
    constructor: ->
        @events = {}

    emit: (event, args...) ->
        return false unless @events[event]
        listener args... for listener in @events[event]
        return true

    addListener: (event, listener) ->
        @emit 'newListener', event, listener
        (@events[event]?=[]).push listener
        return @

    on: @::addListener

    once: (event, listener) ->
        fn = =>
            @removeListener event, fn
            listener arguments...
        @on event, fn
        return @

    removeListener: (event, listener) ->
        return @ unless @events[event]
        @events[event] = (l for l in @events[event] when l isnt listener)
        return @

    removeAllListeners: (event) ->
        delete @events[event]
        return @
        