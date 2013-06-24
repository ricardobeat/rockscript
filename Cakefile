flour = require 'flour'

task 'dev', ->
    flour.minifiers.disable()

task 'build:styles', ->
    compile 'styles/base.less', 'resources/rockscript.css'
    compile 'styles/remote.less', 'resources/remote.css'

task 'build:scripts', ->
    bundle [
        'vendor/*'
    ], 'resources/vendor.js'

    bundle [
        'scripts/shims.js'
        'scripts/ui.js'
        'scripts/main.js'
    ], 'resources/rockscript.js'

task 'build', ->
    invoke 'build:styles'
    invoke 'build:scripts'

task 'watch', ->
    invoke 'build'
    watch 'scripts/*', -> invoke 'build:scripts'
    watch 'styles/*', -> invoke 'build:styles'