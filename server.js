const path = require("path");
const http = require('http')
const express = require("express");
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'ChatCord Bot';

// run when a client connects
io.on('connection', socket => {
    // console.log("new websocket connection...")

    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome a user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'));

        // broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} joined the chat!`));
    })

    // Listen for chat message
    socket.on('chatMessage', (message) => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, message));
    })

    // runs when user disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            // for everyone in room
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat.`))
        }
    })
})

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log("Server is running on port " + port);
});
