flour = require 'flour'

task 'dev', ->
    do flour.minifiers.disable

task 'build:less', ->
    compile 'styles/base.less', 'resources/rockscript.css'
    compile 'styles/remote.less', 'resources/remote.css'

task 'build:coffee', ->
    compile 'scripts/utils.coffee', 'resources/utils.js'
    bundle [
        'scripts/utils.coffee'
        'scripts/spectrum.coffee'
        'scripts/ui.js'
        'scripts/main.js'
    ], 'resources/rockscript.js'

task 'build', ->
    invoke 'build:less'
    invoke 'build:coffee'

task 'watch', ->
    invoke 'build'
    watch 'scripts/*', -> invoke 'build:coffee'
    watch 'styles/*', -> invoke 'build:less'