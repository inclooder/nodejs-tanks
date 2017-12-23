var http = require('http')
var fs = require('fs')
var express = require('express')
var socketio = require('socket.io')
var startGameServer = require('./lib/game_server')

var app = express(server)
var server = http.createServer(app)
var io = socketio(server)

var bindUrlToFile = function(url, filePath){
    app.get(url, function(request, response){
        response.writeHead(200)
        var indexHtml = fs.createReadStream(filePath)
        indexHtml.pipe(response)
    });
}

bindUrlToFile('/assets/style.css', './assets/style.css')
bindUrlToFile('/assets/index.js', './assets/index.js')
bindUrlToFile('/', './assets/index.html')

startGameServer(io)

server.listen(8080);
