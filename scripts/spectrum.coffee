# Canvas
# ============

class window.SpectrumVisualizer
    constructor: (@analyser, @renderer = 'canvas') ->

    createCanvas: ->
        @canvas = document.createElement 'canvas'
        document.getElementById('meters').appendChild @canvas
        @canvas.width = 400
        @canvas.height = 160
        @ctx = @canvas.getContext '2d'

    drawCanvas: =>
        requestAnimationFrame @drawCanvas, @canvas

        frequencies = new Uint8Array @analyser.frequencyBinCount
        @analyser.getByteFrequencyData frequencies

        @ctx.fillStyle = 'rgba(0,0,0,0.1)'
        @ctx.fillRect 0, 0, @canvas.width, @canvas.height

        @ctx.fillStyle = "#abf"

        bars      = 96
        cut       = frequencies.length - 256 # cut-off high frequencies
        size      = Math.floor cut / bars
        spacing   = 2
        bar_width = Math.floor (@canvas.width / bars) - spacing

        for i in [0..bars]
            magnitude = frequencies[i * size]
            @ctx.fillRect i * (bar_width + spacing), @canvas.height, bar_width, -magnitude * 0.7

    createMeters: ->
        @meters = []
        container = document.getElementById('meters')
        for i in [0..16]
            meter = document.createElement('meter')
            meter.value = 0
            meter.high = 0.8
            container.appendChild meter
            @meters.push meter

    drawMeter: =>
        setTimeout @drawMeter, 1000/15

        frequencies = new Uint8Array @analyser.frequencyBinCount
        @analyser.getByteFrequencyData frequencies

        cut  = frequencies.length - 512 # cut-off high frequencies
        size = Math.floor cut / @meters.length

        for meter, i in @meters
            magnitude = frequencies[i * size]
            meter.value = magnitude / 192

    run: ->
        if @renderer is 'meter'
            @createMeters()
            @drawMeter()
        else
            @createCanvas()
            @drawCanvas()
