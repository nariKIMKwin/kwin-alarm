const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let currentCalls = [];

io.on("connection", (socket) => {

    socket.emit("updateCalls", currentCalls);

    socket.on("callBell", (area) => {

        const exist = currentCalls.find(c => c.area === area);

        if (exist) {
            return;
        }

        const item = {
            area: area
        };

        currentCalls.push(item);

        io.emit("updateCalls", currentCalls);

        setTimeout(() => {

            currentCalls = currentCalls.filter(c => c.area !== area);

            io.emit("updateCalls", currentCalls);

        }, 10000);

    });

    socket.on("confirmCall", () => {

        currentCalls = [];

        io.emit("updateCalls", currentCalls);

    });

    socket.on("cancelCall", () => {

        currentCalls = [];

        io.emit("cancelCall");

    });

});

server.listen(3000, () => {

    console.log("서버 실행중");

});