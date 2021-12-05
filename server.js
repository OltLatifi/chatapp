const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages");
const { userJoin, getCurrentUser, userLeaveChat, getRoomUsers } = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// constants
const host = '0.0.0.0';
const PORT = 3000 || process.env.PORT;
const BOT_NAME = "Olt's bot";

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// Run when client connects
io.on("connection", (socket) => {
    socket.on("joinRoom", ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        // broadcast when user connects
        socket.broadcast.to(user.room).emit(
            "message",
            formatMessage(BOT_NAME, `${user.username} has joined the family group chat`)
        );

        // send user and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });



        // user disconnects
        socket.on("disconnect", () => {
            const user = userLeaveChat(socket.id);
            if (user) {
                // broadcast when user disconnects
                io.to(user.room).emit("message", formatMessage(BOT_NAME, `${user.username} has disconnected from the family group chat`));
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
            }

        });
        socket.on("chatMessage", (msg) => {
            // Listen/wait for chatMessage (accesing public message on the server)

            const user = getCurrentUser(socket.id);
            io.to(user.room).emit("message", formatMessage(user.username, msg));
            // console.log(msg)
        });

        socket.emit(
            "message",
            formatMessage(BOT_NAME, "Welcome to Family GroupChat")
        );
    });




});

server.listen(PORT, host, () => console.log(`Server running on port ${PORT}`));