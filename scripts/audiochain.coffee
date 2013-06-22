class AudioChain
    constructor: (@set) ->

    link: ->
        for node, i in @set
            next = @set[i+1]
            input = next?.input or next
            node.connect input if input
            node.chained = true
        @set.slice(-1)[0].chained = true

    prepare: (node, cb) ->
        if typeof node isnt 'number'
            node = @set.indexOf node
        self = @set[node]
        next = @set[node+1]
        i = 2
        while next and not next.chained
            next = @set[node+i]
            i++
        prev = @set[node-1]
        i = 2
        while prev and not prev.chained
            prev = @set[node-i]
            i++
        if next and prev
            cb self, next, prev

    disconnect: (node) ->
        console.log 'disconnecting', node
        @prepare node, (self, next, prev) ->
            self.disconnect 0
            prev.disconnect 0
            prev.connect next.input or next
            self.chained = false

    connect: (node) ->
        console.log 'connecting', node
        @prepare node, (self, next, prev) ->
            prev.disconnect 0
            prev.connect self.input or self
            self.connect next.input or next
            self.chained = true

    toggle: (node, state) ->
        if typeof node is 'number'
            node = @set[node]

        if node.bypass?
            return node.bypass = +!node.bypass

        @[if node.chained then 'disconnect' else 'connect'] node
        return node.chained

    indexOf: (node) ->
        @set.indexOf node

    replace: (node, new_node) ->
        if typeof node isnt 'number'
            index = @set.indexOf node
        else
            index = node
        @disconnect index
        @set.splice(index, 1, new_node)
        @connect index

if @exports
    @exports = AudioChain
else
    window.AudioChain = AudioChain
