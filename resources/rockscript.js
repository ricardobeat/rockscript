(function() {
  var EventEmitter,
    __hasProp = {}.hasOwnProperty,
    __slice = [].slice;

  window.requestAnimationFrame || (window.requestAnimationFrame = window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame || function(fn) {
    return setTimeout(fn, 1000 / 60);
  });

  window.AudioContext || (window.AudioContext = window.webkitAudioContext || window.mozAudioContext || window.msAudioContext || window.oAudioContext);

  navigator.getUserMedia || (navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia);

  window.using = function(context, fn) {
    return fn.call(context);
  };

  window.extend = function(dest, source) {
    var key, val;
    for (key in source) {
      if (!__hasProp.call(source, key)) continue;
      val = source[key];
      dest[key] = val;
    }
    return dest;
  };

  window.EventEmitter = EventEmitter = (function() {
    function EventEmitter() {
      this.events = {};
    }

    EventEmitter.prototype.emit = function() {
      var args, event, listener, _i, _len, _ref;
      event = arguments[0], args = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      if (!this.events[event]) {
        return false;
      }
      _ref = this.events[event];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        listener.apply(null, args);
      }
      return true;
    };

    EventEmitter.prototype.addListener = function(event, listener) {
      var _base;
      this.emit('newListener', event, listener);
      ((_base = this.events)[event] != null ? (_base = this.events)[event] : _base[event] = []).push(listener);
      return this;
    };

    EventEmitter.prototype.on = EventEmitter.prototype.addListener;

    EventEmitter.prototype.once = function(event, listener) {
      var fn,
        _this = this;
      fn = function() {
        _this.removeListener(event, fn);
        return listener.apply(null, arguments);
      };
      this.on(event, fn);
      return this;
    };

    EventEmitter.prototype.removeListener = function(event, listener) {
      var l;
      if (!this.events[event]) {
        return this;
      }
      this.events[event] = (function() {
        var _i, _len, _ref, _results;
        _ref = this.events[event];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          l = _ref[_i];
          if (l !== listener) {
            _results.push(l);
          }
        }
        return _results;
      }).call(this);
      return this;
    };

    EventEmitter.prototype.removeAllListeners = function(event) {
      delete this.events[event];
      return this;
    };

    return EventEmitter;

  })();

}).call(this);

;(function() {
  var __slice = [].slice;

  window.UI = {
    createSwitch: function(name) {
      var item, label, state, toggle, _switch;
      item = document.createElement('li');
      _switch = document.createElement('input');
      _switch.type = 'checkbox';
      _switch.setAttribute('data-icon1', '◡̍');
      _switch.setAttribute('data-icon2', '∅');
      state = true;
      toggle = function() {
        return PedalBoard.emit('toggle', name.toLowerCase(), state);
      };
      _switch.addEventListener('click', function() {
        state = !state;
        return toggle();
      });
      PedalBoard.on('toggle', function(effect, new_state) {
        var str;
        if (effect !== name.toLowerCase()) {
          return;
        }
        state = new_state;
        str = state === false ? 'off' : 'on';
        _switch.className = str;
        _switch.checked = !state;
        return localStorage[name] = str;
      });
      if (localStorage[name] === 'off') {
        state = false;
        toggle();
      }
      label = document.createElement('label');
      label.innername = name;
      item.appendChild(_switch);
      item.appendChild(label);
      document.querySelector('.pedals .switches').appendChild(item);
      return item;
    },
    createDistortionSelector: function(effect_index) {
      var dist, i, inp, name, _i, _len, _ref;
      dist = document.querySelector('.distortion');
      _ref = 'ABCDE';
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        name = _ref[i];
        inp = document.createElement('input');
        inp.type = 'radio';
        inp.name = 'distortion';
        inp.id = 'distortion_' + name;
        if (OVERDRIVES[name] === OVERDRIVES.current) {
          inp.checked = true;
        }
        inp.setAttribute('data-icon', name);
        dist.appendChild(inp);
        inp.addEventListener('change', function(e) {
          var type;
          if (!this.checked) {
            return;
          }
          type = this.getAttribute('data-icon');
          return PedalBoard.emit('distortion', type);
        });
      }
      return PedalBoard.on('distortion', function(type) {
        return document.querySelector('#distortion_' + type).checked = true;
      });
    }
  };

  window.EffectControl = (function() {
    function EffectControl(name, context, callback) {
      this.context = context;
      this.callback = callback;
      this.folder = gui.addFolder(name);
    }

    EffectControl.prototype.add = function() {
      var args, control;
      args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      control = this.folder.add.apply(this.folder, [this.context].concat(args));
      control.onFinishChange(this.callback);
      control.step(0.1);
      return control;
    };

    return EffectControl;

  })();

}).call(this);

;(function() {
  var AudioChain;

  AudioChain = (function() {
    function AudioChain(set) {
      this.set = set;
    }

    AudioChain.prototype.link = function() {
      var i, input, next, node, _i, _len, _ref;
      _ref = this.set;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        node = _ref[i];
        next = this.set[i + 1];
        input = (next != null ? next.input : void 0) || next;
        if (input) {
          node.connect(input);
        }
        node.chained = true;
      }
      return this.set.slice(-1)[0].chained = true;
    };

    AudioChain.prototype.prepare = function(node, cb) {
      var i, next, prev, self;
      if (typeof node !== 'number') {
        node = this.set.indexOf(node);
      }
      self = this.set[node];
      next = this.set[node + 1];
      i = 2;
      while (next && !next.chained) {
        next = this.set[node + i];
        i++;
      }
      prev = this.set[node - 1];
      i = 2;
      while (prev && !prev.chained) {
        prev = this.set[node - i];
        i++;
      }
      if (next && prev) {
        return cb(self, next, prev);
      }
    };

    AudioChain.prototype.disconnect = function(node) {
      console.log('disconnecting', node);
      return this.prepare(node, function(self, next, prev) {
        self.disconnect(0);
        prev.disconnect(0);
        prev.connect(next.input || next);
        return self.chained = false;
      });
    };

    AudioChain.prototype.connect = function(node) {
      console.log('connecting', node);
      return this.prepare(node, function(self, next, prev) {
        prev.disconnect(0);
        prev.connect(self.input || self);
        self.connect(next.input || next);
        return self.chained = true;
      });
    };

    AudioChain.prototype.toggle = function(node) {
      if (typeof node === 'number') {
        node = this.set[node];
      }
      this[node.chained ? 'disconnect' : 'connect'](node);
      return node.chained;
    };

    AudioChain.prototype.indexOf = function(node) {
      return this.set.indexOf(node);
    };

    AudioChain.prototype.replace = function(node, new_node) {
      var index;
      if (typeof node !== 'number') {
        index = this.set.indexOf(node);
      } else {
        index = node;
      }
      this.disconnect(index);
      this.set.splice(index, 1, new_node);
      return this.connect(index);
    };

    return AudioChain;

  })();

  window.AudioChain = AudioChain;

}).call(this);

;(function() {
  var Point, _ref, _ref1,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.SpectrumVisualizer = (function() {
    function SpectrumVisualizer(analyser, options) {
      this.analyser = analyser;
      this.options = options;
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.draw = __bind(this.draw, this);
      this.analyser.fftSize = 2048;
    }

    SpectrumVisualizer.prototype.setup = function() {
      this.canvas = document.createElement('canvas');
      document.getElementById('meters').appendChild(this.canvas);
      this.canvas.width = 400;
      this.canvas.height = 160;
      return this.ctx = this.canvas.getContext('2d');
    };

    SpectrumVisualizer.prototype.draw = function() {
      var bar_width, bars, cut, frequencies, i, magnitude, size, spacing, _i, _results;
      if (this.running) {
        requestAnimationFrame(this.draw, this.canvas);
      }
      frequencies = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(frequencies);
      this.ctx.fillStyle = 'rgba(0,0,0,0.1)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = "#abf";
      bars = 96;
      cut = frequencies.length - 256;
      size = Math.floor(cut / bars);
      spacing = 2;
      bar_width = Math.floor((this.canvas.width / bars) - spacing);
      _results = [];
      for (i = _i = 0; 0 <= bars ? _i <= bars : _i >= bars; i = 0 <= bars ? ++_i : --_i) {
        magnitude = frequencies[i * size];
        _results.push(this.ctx.fillRect(i * (bar_width + spacing), this.canvas.height, bar_width, -magnitude * 0.7));
      }
      return _results;
    };

    SpectrumVisualizer.prototype.start = function() {
      this.running = true;
      return this.draw();
    };

    SpectrumVisualizer.prototype.stop = function() {
      return this.running = false;
    };

    SpectrumVisualizer.prototype.run = function() {
      this.setup();
      return this.start();
    };

    return SpectrumVisualizer;

  })();

  window.MeterViz = (function(_super) {
    __extends(MeterViz, _super);

    function MeterViz() {
      this.draw = __bind(this.draw, this);
      _ref = MeterViz.__super__.constructor.apply(this, arguments);
      return _ref;
    }

    MeterViz.prototype.setup = function() {
      var container, i, meter, _i, _results;
      this.meters = [];
      container = document.getElementById('meters');
      _results = [];
      for (i = _i = 0; _i <= 16; i = ++_i) {
        meter = document.createElement('meter');
        meter.value = 0;
        meter.high = 0.8;
        container.appendChild(meter);
        _results.push(this.meters.push(meter));
      }
      return _results;
    };

    MeterViz.prototype.draw = function() {
      var cut, frequencies, i, magnitude, meter, size, _i, _len, _ref1, _results;
      if (this.running) {
        setTimeout(this.draw, 1000 / 15);
      }
      frequencies = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(frequencies);
      cut = frequencies.length - 512;
      size = Math.floor(cut / this.meters.length);
      _ref1 = this.meters;
      _results = [];
      for (i = _i = 0, _len = _ref1.length; _i < _len; i = ++_i) {
        meter = _ref1[i];
        magnitude = frequencies[i * size];
        _results.push(meter.value = magnitude / 192);
      }
      return _results;
    };

    return MeterViz;

  })(SpectrumVisualizer);

  Point = (function() {
    function Point(x, y) {
      this.x = x;
      this.y = y;
    }

    return Point;

  })();

  window.SpaceViz = (function(_super) {
    __extends(SpaceViz, _super);

    function SpaceViz() {
      this.draw = __bind(this.draw, this);
      _ref1 = SpaceViz.__super__.constructor.apply(this, arguments);
      return _ref1;
    }

    SpaceViz.prototype.setup = function() {
      this.canvas = document.createElement('canvas');
      this.canvas.className = 'spaceviz';
      document.getElementById('meters').appendChild(this.canvas);
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight / 2;
      this.canvas.style.marginTop = -Math.floor(this.canvas.height / 2) + 'px';
      return this.ctx = this.canvas.getContext('2d');
    };

    SpaceViz.prototype.draw = function() {
      var bar_width, bars, cut, fillColor, frequencies, height, i, magnitude, offset, points, points2, size, smoothing, spacing, startingPoint, x, xc, y, yc, _i, _j, _k, _ref2, _ref3;
      if (this.running) {
        requestAnimationFrame(this.draw, this.canvas);
      }
      frequencies = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(frequencies);
      this.ctx.fillStyle = 'rgba(0,0,0,0.2)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      fillColor = [30, 30, 255, 0.6];
      this.ctx.fillStyle = "rgba(" + fillColor + ")";
      bars = 200;
      cut = frequencies.length - 128;
      size = Math.floor(cut / bars);
      spacing = 2;
      bar_width = Math.ceil((this.canvas.width / bars) - spacing);
      smoothing = 20;
      startingPoint = new Point(-10, this.canvas.height / 2);
      points = [startingPoint];
      for (i = _i = 0; 0 <= bars ? _i <= bars : _i >= bars; i = 0 <= bars ? ++_i : --_i) {
        magnitude = frequencies[i * size];
        height = magnitude / 256 * this.canvas.height | 0;
        offset = (this.canvas.height - height) / 2 | 0;
        fillColor[0] = fillColor[1] = 196 - (magnitude / 2) | 0;
        fillColor[2] = 192 + (magnitude / 4 | 0);
        fillColor[3] = (magnitude / 256).toFixed(2);
        this.ctx.fillStyle = "rgba(" + fillColor + ")";
        x = i * (bar_width + spacing);
        y = offset;
        this.ctx.fillRect(x, y, bar_width, height);
        if (i % smoothing === 10) {
          points.push(new Point(x, y));
        } else if (i % smoothing === 0) {
          points.push(new Point(x, y + height));
        }
      }
      points2 = [startingPoint];
      this.ctx.lineWidth = 2;
      this.ctx.strokeStyle = 'rgba(255,255,255, 0.3)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.canvas.height / 2);
      for (i = _j = 1, _ref2 = points.length - 2; 1 <= _ref2 ? _j < _ref2 : _j > _ref2; i = 1 <= _ref2 ? ++_j : --_j) {
        xc = (points[i].x + points[i + 1].x) / 2;
        yc = (points[i].y + points[i + 1].y) / 2;
        this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        points2.push(new Point(points[i].x, this.canvas.height - points[i].y));
      }
      this.ctx.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      this.ctx.stroke();
      this.ctx.lineWidth = 4;
      this.ctx.strokeStyle = 'rgba(150,150,255, 0.1)';
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.canvas.height / 2);
      for (i = _k = 1, _ref3 = points2.length - 2; 1 <= _ref3 ? _k < _ref3 : _k > _ref3; i = 1 <= _ref3 ? ++_k : --_k) {
        xc = (points2[i].x + points2[i + 1].x) / 2;
        yc = (points2[i].y + points2[i + 1].y) / 2;
        this.ctx.quadraticCurveTo(points2[i].x, points2[i].y, xc, yc);
      }
      return this.ctx.stroke();
    };

    return SpaceViz;

  })(SpectrumVisualizer);

}).call(this);

;(function() {
  var DELAY_OPTIONS, TREMOLO_OPTIONS, anal, context, delay, gain, i, init, name, options, saved, setupEvents, tremolo, tuna, updateDelay, updateOverdrive, updateTremolo, _i, _len, _ref, _ref1, _ref2;

  window.gui = new dat.GUI();

  window.PedalBoard = new EventEmitter;

  context = new AudioContext;

  anal = context.createAnalyser();

  tuna = new Tuna(context);

  gain = context.createGainNode();

  gain.gain.value = 6;

  window.OVERDRIVES = {};

  window.createOverdrive = function(name, opts) {
    var options, stored_options;
    options = {
      outputGain: .7,
      drive: 1,
      curveAmount: 0.7,
      algorithmIndex: 0,
      bypass: 0
    };
    extend(options, opts);
    OVERDRIVES[name] = new tuna.Overdrive(options);
    OVERDRIVES[name]._name = name;
    if (stored_options = OVERDRIVES["options_" + name]) {
      return extend(stored_options, options);
    } else {
      return OVERDRIVES["options_" + name] = options;
    }
  };

  updateOverdrive = function(name) {
    if (typeof name !== 'string') {
      name = OVERDRIVES.current._name;
    }
    createOverdrive(name, OVERDRIVES["options_" + name]);
    return OVERDRIVES.set(name);
  };

  OVERDRIVES.set = function(overdrive) {
    if (typeof overdrive === 'string') {
      overdrive = OVERDRIVES[overdrive];
    }
    chain.replace(OVERDRIVES.current, overdrive);
    return OVERDRIVES.current = overdrive;
  };

  _ref = 'ABCDE';
  for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
    name = _ref[i];
    options = {
      algorithmIndex: i
    };
    if (saved = (_ref1 = gui.load) != null ? (_ref2 = _ref1.remembered) != null ? _ref2[gui.preset][i] : void 0 : void 0) {
      extend(options, saved);
    }
    createOverdrive(name, options);
    options = OVERDRIVES["options_" + name];
    gui.remember(options);
    using(new EffectControl("Overdrive " + name, options, updateOverdrive), function() {
      this.add('outputGain', 0, 1);
      this.add('drive', 0, 1);
      return this.add('curveAmount', 0, 1);
    });
  }

  OVERDRIVES.current = OVERDRIVES.A;

  DELAY_OPTIONS = {
    feedback: 0.6,
    delayTime: 150,
    wetLevel: .8,
    dryLevel: .5,
    cutoff: 8000,
    bypass: 0
  };

  delay = new tuna.Delay(DELAY_OPTIONS);

  updateDelay = function() {
    return chain.replace(delay, new tuna.Delay(DELAY_OPTIONS));
  };

  using(new EffectControl("Delay", DELAY_OPTIONS, updateDelay), function() {
    this.add('feedback', 0, 1);
    this.add('delayTime', 0, 1000);
    this.add('wetLevel', 0, 1);
    this.add('dryLevel', 0, 1);
    return this.add('cutoff', 20, 22050);
  });

  TREMOLO_OPTIONS = {
    intensity: 0.3,
    rate: 0.1,
    stereoPhase: 0,
    bypass: 0
  };

  tremolo = new tuna.Tremolo(TREMOLO_OPTIONS);

  updateTremolo = function() {
    return chain.replace(tremolo, new tuna.Tremolo(TREMOLO_OPTIONS));
  };

  using(new EffectControl("Tremolo", TREMOLO_OPTIONS, updateTremolo), function() {
    this.add('intensity', 0, 1);
    this.add('rate', 0, 8);
    return this.add('stereoPhase', 0, 180);
  });

  setupEvents = function() {
    var effects;
    effects = {
      overdrive: chain.indexOf(OVERDRIVES.current),
      delay: chain.indexOf(delay),
      tremolo: chain.indexOf(tremolo)
    };
    this.on('toggle', function(name, state) {
      return chain.toggle(effects[name]);
    });
    return this.on('distortion', function(type) {
      return OVERDRIVES.set(type);
    });
  };

  init = function(input) {
    var s, source;
    source = context.createMediaStreamSource(input);
    window.chain = new AudioChain([source, anal, gain, OVERDRIVES.current, delay, tremolo, context.destination]);
    chain.link();
    UI.createSwitch('Overdrive', chain.indexOf(OVERDRIVES.current));
    UI.createDistortionSelector(OVERDRIVES.current);
    UI.createSwitch('Delay', chain.indexOf(delay));
    UI.createSwitch('Tremolo', chain.indexOf(tremolo));
    anal.minDecibels = -65;
    if (document.querySelector('.screenview')) {
      s = new SpaceViz(anal);
    } else {
      s = new MeterViz(anal);
    }
    s.run();
    return using(PedalBoard, setupEvents);
  };

  navigator.getUserMedia({
    audio: true
  }, init);

}).call(this);

;(function() {
  var socket;

  socket = io.connect();

  socket.on('toggle', function(effect, state) {
    console.log('toggle', effect, state);
    return PedalBoard.emit('toggle', effect, state);
  });

  socket.on('distortion', function(type) {
    console.log('select distortion', type);
    return PedalBoard.emit('distortion', type);
  });

}).call(this);
