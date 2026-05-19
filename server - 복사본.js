const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let currentCall = null;

io.on("connection", (socket) => {

    socket.emit("currentCall", currentCall);

    socket.on("callBell", (area) => {

        currentCall = {
            area: area
        };

        io.emit("newCall", currentCall);

        setTimeout(() => {

            currentCall = null;

            io.emit("removeCall");

        }, 60000);

    });

});

server.listen(3000, () => {

    console.log("서버 실행중");

});