// Generated by CoffeeScript 1.6.3
// http://github.com/ricardobeat/waves
(function() {
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
      document.getElementById('viz').appendChild(this.canvas);
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
      container = document.getElementById('viz');
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

    SpaceViz.prototype.makeCanvas = function(name) {
      var canvas;
      canvas = document.createElement('canvas');
      canvas.className = name;
      document.getElementById('viz').appendChild(canvas);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight / 2;
      canvas.style.marginTop = -Math.floor(canvas.height / 2) + 'px';
      return canvas;
    };

    SpaceViz.prototype.setup = function() {
      this.canvas = this.makeCanvas('spaceviz');
      this.ctxbars = this.canvas.getContext('2d');
      this.cwave = this.makeCanvas('spaceviz-wave');
      return this.ctxwave = this.cwave.getContext('2d');
    };

    SpaceViz.prototype.draw = function() {
      var bar_width, bars, boomTimer, cut, fillColor, frequencies, height, i, magnitude, offset, points, points2, size, smoothing, spacing, startingPoint, x, xc, y, yc, _i, _j, _k, _ref2, _ref3,
        _this = this;
      if (this.running) {
        requestAnimationFrame(this.draw, this.canvas);
      }
      frequencies = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(frequencies);
      this.ctxbars.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctxwave.clearRect(0, 0, this.cwave.width, this.cwave.height);
      fillColor = [30, 30, 255, 0.8];
      this.ctxbars.fillStyle = "rgba(" + fillColor + ")";
      bars = 200;
      cut = frequencies.length - 512;
      size = Math.floor(cut / bars);
      spacing = 2;
      bar_width = Math.ceil((this.canvas.width / bars) - spacing);
      smoothing = 10;
      startingPoint = new Point(-10, this.canvas.height / 2);
      points = [startingPoint];
      boomTimer = 0;
      for (i = _i = 0; 0 <= bars ? _i <= bars : _i >= bars; i = 0 <= bars ? ++_i : --_i) {
        magnitude = frequencies[i * size];
        height = magnitude / 256 * this.canvas.height | 0;
        offset = (this.canvas.height - height) / 2 | 0;
        fillColor[0] = fillColor[1] = 196 - (magnitude / 2) | 0;
        fillColor[2] = 192 + (magnitude / 4 | 0);
        fillColor[3] = (magnitude / 256).toFixed(2);
        this.ctxbars.fillStyle = "rgba(" + fillColor + ")";
        x = i * (bar_width + spacing);
        y = offset;
        this.ctxbars.fillRect(x, y, bar_width, height);
        if (magnitude < 10) {
          y += (Math.random() - 0.5) * 2 | 0;
        }
        if (i % smoothing === 10) {
          points.push(new Point(x, y));
        } else if (i % smoothing === 0) {
          points.push(new Point(x, y + height));
        }
        if (i === 30 && magnitude > 170) {
          document.body.classList.add('boom');
          clearTimeout(boomTimer);
          boomTimer = setTimeout(function() {
            return document.body.classList.remove('boom');
          }, 350);
        }
      }
      points2 = [startingPoint];
      this.ctxwave.lineWidth = 2;
      this.ctxwave.strokeStyle = 'rgba(255,255,255, 0.5)';
      this.ctxwave.beginPath();
      this.ctxwave.moveTo(0, this.canvas.height / 2);
      for (i = _j = 1, _ref2 = points.length - 2; 1 <= _ref2 ? _j < _ref2 : _j > _ref2; i = 1 <= _ref2 ? ++_j : --_j) {
        xc = (points[i].x + points[i + 1].x) / 2;
        yc = (points[i].y + points[i + 1].y) / 2;
        this.ctxwave.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
        points2.push(new Point(points[i].x, this.canvas.height - points[i].y));
      }
      this.ctxwave.quadraticCurveTo(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
      this.ctxwave.stroke();
      this.ctxwave.lineWidth = 3;
      this.ctxwave.strokeStyle = 'rgba(150,150,255, 0.2)';
      this.ctxwave.beginPath();
      this.ctxwave.moveTo(0, this.canvas.height / 2);
      for (i = _k = 1, _ref3 = points2.length - 2; 1 <= _ref3 ? _k < _ref3 : _k > _ref3; i = 1 <= _ref3 ? ++_k : --_k) {
        xc = (points2[i].x + points2[i + 1].x) / 2;
        yc = (points2[i].y + points2[i + 1].y) / 2;
        this.ctxwave.quadraticCurveTo(points2[i].x, points2[i].y, xc, yc);
      }
      return this.ctxwave.stroke();
    };

    return SpaceViz;

  })(SpectrumVisualizer);

}).call(this);
