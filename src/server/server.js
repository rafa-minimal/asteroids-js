const express = require('express');

const app = express();
app.use('/', express.static('dist'));



// todo: to be moved to separate game-server.js
require('express-ws')(app);
const Game = require('./game.js');
const WebSocket = require('ws');

const game = new Game();
game.start();

app.ws('/echo', function(ws, req) {
    console.log('new client connected');
    game.addPlayer(ws);
    ws.on('message', function(msg) {
        console.log('message');
        game.handleInput(msg);
    });
    ws.on('close', function(args) {
        console.log('closed: ', args);
        game.removePlayer(ws)
    });
    ws.on('ping', function(args) {
        console.log('ping: ', args);
    });
    ws.on('pong', function(args) {
        console.log('pong: ', args);
    });
    ws.on('unexpected-response', function(args) {
        console.log('unexpected-response: ', args);
    });
    ws.on('error', function(args) {
        console.log('error: ', args);
    });
});

/*function update() {
    clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send("update!");
        }
    })
}

setInterval(update, 2000);*/

// --
const port = process.env.PORT || 8080;
const server = app.listen(port, 'localhost', () => {
    console.log(`Server listening on port ${port}`);
});

process.once('SIGINT', function (code) {
    console.log('Shutting down...');
    server.close();
});

process.once('SIGTERM', function (code) {
    console.log('Shutting down...');
    server.close();
});