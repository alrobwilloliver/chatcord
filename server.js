const path = require("path");
const http = require('http')
const express = require("express");
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// run when a client connects
io.on('connection', socket => {
    // console.log("new websocket connection...")

    socket.emit('message', 'Welcome to ChatCord!')

    // broadcast when a user connects
    socket.broadcast.emit('message', 'A user has joined the chat!');

    // runs when user disconnects
    socket.on('disconnect', () => {
        // for everyone
        io.emit('message', 'A user has left the chat.')
    })

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        io.emit('message', message)
    })
})

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const port = 3000 || process.env.PORT;
server.listen(port, () => {
    console.log("Server is running on port " + port);
});
