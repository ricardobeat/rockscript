;(function(){

    var isTouch = 'ontouchstart' in window

    function RockScriptUI (root, emitter) {
        this.root    = typeof root === 'string' ? document.querySelector(root) : root
        this.emitter = emitter

        this.switches = {}
        this.bindEvents()
    }

    RockScriptUI.prototype.bindEvents = function () {
        var switches = this.switches
        this.emitter.on('toggleSwitch', function (name, active) {
            switches[name].classList[active ? 'add' : 'remove']('on')
        })
    }

    // Create a switch (starts on OFF state)
    RockScriptUI.prototype.createSwitch = function (name) {
        var state = false
          , _switch = document.createElement('div')
          , emitter = this.emitter
          , lastTouch

        _switch.classList.add('switch')
        _switch.textContent = name

        _switch.addEventListener(isTouch ? 'touchstart' : 'click', function (e) {
            if (Date.now() - lastTouch < 100) return
            lastTouch = Date.now()
            emitter.emit('toggleSwitch', name, state = !state)
        }, false)

        this.root.appendChild(_switch)
        this.switches[name] = _switch
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = RockScriptUI
    } else {
        window.RockScriptUI = RockScriptUI
    }

})();
