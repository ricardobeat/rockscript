(function() {
  var $, $$, buttons, lastChange, socket, states, updateDistortionState;

  socket = io.connect();

  $ = function(selector) {
    return document.querySelector(selector);
  };

  $$ = function(selector) {
    return document.querySelectorAll(selector);
  };

  states = {};

  lastChange = {};

  ['overdrive', 'delay', 'tremolo'].forEach(function(effect) {
    states[effect] = true;
    return $('#' + effect).addEventListener('touchstart', function(e) {
      var state;
      if (Date.now() - lastChange[effect] < 100) {
        return;
      }
      state = states[effect] = !states[effect];
      e.target.className = ['off', 'on'][+state];
      socket.emit('toggle', effect, state);
      return lastChange[effect] = Date.now();
    });
  });

  document.ontouchmove = function(e) {
    return e.preventDefault();
  };

  buttons = $$('.distortion button');

  updateDistortionState = function(type) {
    var button, _i, _len, _results;
    _results = [];
    for (_i = 0, _len = buttons.length; _i < _len; _i++) {
      button = buttons[_i];
      _results.push(button.className = ['off', 'on'][+(button.id === 'distortion_' + type)]);
    }
    return _results;
  };

  updateDistortionState('A');

  ['A', 'B', 'C', 'D', 'E'].forEach(function(type) {
    return $("#distortion_" + type).addEventListener('touchstart', function(e) {
      updateDistortionState(type);
      return socket.emit('distortion', type);
    });
  });

}).call(this);
