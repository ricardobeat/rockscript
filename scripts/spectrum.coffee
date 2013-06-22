# Meters
# -----------------------------------------------------------------------------

class window.SpectrumVisualizer
    constructor: (@analyser, @options) ->
        @analyser.fftSize = 2048

    setup: ->
        @canvas = document.createElement 'canvas'
        document.getElementById('viz').appendChild @canvas
        @canvas.width = 400
        @canvas.height = 160
        @ctx = @canvas.getContext '2d'

    draw: =>
        requestAnimationFrame @draw, @canvas if @running

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

    start: =>
        @running = true
        @draw()

    stop: =>
        @running = false

    run: ->
        @setup()
        @start()


# Canvas
# -----------------------------------------------------------------------------

class window.MeterViz extends SpectrumVisualizer
    setup: ->
        @meters = []
        container = document.getElementById('viz')
        for i in [0..16]
            meter = document.createElement('meter')
            meter.value = 0
            meter.high = 0.8
            container.appendChild meter
            @meters.push meter

    draw: =>
        setTimeout @draw, 1000/15 if @running

        frequencies = new Uint8Array @analyser.frequencyBinCount
        @analyser.getByteFrequencyData frequencies

        cut  = frequencies.length - 512 # cut-off high frequencies
        size = Math.floor cut / @meters.length

        for meter, i in @meters
            magnitude = frequencies[i * size]
            meter.value = magnitude / 192

# Full-screen sinewave
# -----------------------------------------------------------------------------

class Point
    constructor: (@x, @y) ->

class window.SpaceViz extends SpectrumVisualizer

    makeCanvas: (name) ->
        canvas = document.createElement 'canvas'
        canvas.className = name
        document.getElementById('viz').appendChild canvas
        canvas.width  = window.innerWidth
        canvas.height = window.innerHeight / 2
        canvas.style.marginTop = - Math.floor(canvas.height / 2) + 'px'
        return canvas

    setup: ->
        @canvas  = @makeCanvas 'spaceviz'
        @ctxbars = @canvas.getContext '2d'
        @cwave   = @makeCanvas 'spaceviz-wave'
        @ctxwave = @cwave.getContext '2d'

    draw: =>
        requestAnimationFrame @draw, @canvas if @running

        frequencies = new Uint8Array @analyser.frequencyBinCount
        @analyser.getByteFrequencyData frequencies

        # @ctx.fillStyle = 'rgba(0,0,0,0.2)'
        # @ctx.fillRect 0, 0, @canvas.width, @canvas.height
        @ctxbars.clearRect 0, 0, @canvas.width, @canvas.height
        @ctxwave.clearRect 0, 0, @cwave.width, @cwave.height

        fillColor = [30, 30, 255, 0.8]
        @ctxbars.fillStyle = "rgba(#{fillColor})"

        bars      = 200
        cut       = frequencies.length - 512 # cut-off high frequencies
        size      = Math.floor cut / bars
        spacing   = 2
        bar_width = Math.ceil (@canvas.width / bars) - spacing

        smoothing = 10
        startingPoint = new Point(-10, @canvas.height / 2)
        points = [startingPoint]

        boomTimer = 0

        for i in [0..bars]
            magnitude = frequencies[i * size]
            height = magnitude/256 * @canvas.height | 0
            offset = (@canvas.height - height) / 2 | 0

            fillColor[0] = fillColor[1] = 196 - (magnitude/2) | 0
            fillColor[2] = 192 + (magnitude/4 | 0)
            fillColor[3] = (magnitude/256).toFixed(2)
            @ctxbars.fillStyle = "rgba(#{fillColor})"

            x = i * (bar_width + spacing)
            y = offset

            @ctxbars.fillRect x, y, bar_width, height

            if magnitude < 10
                y += (Math.random() - 0.5) * 2 | 0

            if i % smoothing == 10
                points.push new Point(x, y)
            else if i % smoothing == 0
                points.push new Point(x, y + height)

            if i == 30 and magnitude > 170
                document.body.classList.add 'boom'
                clearTimeout boomTimer
                boomTimer = setTimeout =>
                    document.body.classList.remove 'boom'
                , 350

        points2 = [startingPoint]

        # draw curve
        @ctxwave.lineWidth = 2
        @ctxwave.strokeStyle = 'rgba(255,255,255, 0.5)'
        @ctxwave.beginPath()
        @ctxwave.moveTo(0, @canvas.height / 2)

        for i in [1...points.length-2]
            xc = (points[i].x + points[i + 1].x) / 2
            yc = (points[i].y + points[i + 1].y) / 2
            @ctxwave.quadraticCurveTo points[i].x, points[i].y, xc, yc

            points2.push new Point(points[i].x, @canvas.height - points[i].y)

        # last two points
        @ctxwave.quadraticCurveTo points[i].x, points[i].y, points[i+1].x, points[i+1].y
        @ctxwave.stroke()

        # 2nd curve
        @ctxwave.lineWidth = 3
        @ctxwave.strokeStyle = 'rgba(150,150,255, 0.2)'
        @ctxwave.beginPath()
        @ctxwave.moveTo(0, @canvas.height / 2)

        for i in [1...points2.length-2]
            xc = (points2[i].x + points2[i + 1].x) / 2
            yc = (points2[i].y + points2[i + 1].y) / 2
            @ctxwave.quadraticCurveTo points2[i].x, points2[i].y, xc, yc

        @ctxwave.stroke()
