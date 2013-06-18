window.UI = 
    createSwitch: (name) ->
        item = document.createElement 'li'

        _switch = document.createElement 'input'
        _switch.type = 'checkbox'
        _switch.setAttribute 'data-icon1', '◡̍'
        _switch.setAttribute 'data-icon2', '∅'

        state = on

        toggle = -> PedalBoard.emit 'toggle', name.toLowerCase(), state

        _switch.addEventListener 'click', ->
            state = !state
            toggle()

        PedalBoard.on 'toggle', (effect, new_state) ->
            return if effect isnt name.toLowerCase()
            state = new_state
            str = if state is off then 'off' else 'on'
            _switch.className = str
            _switch.checked = !state # styles are inverted :(
            localStorage[name] = str

        if localStorage[name] is 'off'
            state = off
            toggle()

        label = document.createElement 'label'
        label.innername = name

        item.appendChild _switch
        item.appendChild label
        document.querySelector('.pedals .switches').appendChild item
        
        return item

    createDistortionSelector: (effect_index) ->
        dist = document.querySelector '.distortion'

        for name, i in 'ABCDE'
            inp = document.createElement 'input'
            inp.type = 'radio'
            inp.name = 'distortion'
            inp.id = 'distortion_' + name
            inp.checked = true if OVERDRIVES[name] is OVERDRIVES.current
            inp.setAttribute 'data-icon', name
            dist.appendChild inp

            inp.addEventListener 'change', (e) ->
                return unless @checked
                type = @getAttribute 'data-icon'
                PedalBoard.emit 'distortion', type

        PedalBoard.on 'distortion', (type) ->
            document.querySelector('#distortion_'+type).checked = true

class window.EffectControl
    constructor: (name, @context, @callback) ->
        @folder = gui.addFolder name
    add: (args...) ->
        control = @folder.add.apply @folder, [@context].concat(args)
        control.onFinishChange @callback
        control.step(0.1)
        return control
