flour = require 'flour'

task 'build:less', ->
    flour.minifiers.css = null
    compile 'styles/base.less', 'resources/rockscript.css'
    compile 'styles/remote.less', 'resources/remote.css'

task 'build:coffee', ->
    flour.minifiers.js = null
    bundle [
        'scripts/utils.coffee'
        'scripts/ui.coffee'
        'scripts/audiochain.coffee'
        'scripts/spectrum.coffee'
        'scripts/main.coffee'
        'scripts/socket.coffee'
    ], 'resources/rockscript.js'

    compile 'scripts/remote.coffee', 'resources/remote.js'

task 'build', ->
    invoke 'build:less'
    invoke 'build:coffee'

task 'watch', ->
    invoke 'build'
    watch 'scripts/*.coffee', -> invoke 'build:coffee'
    watch 'styles/*.less', -> invoke 'build:less'