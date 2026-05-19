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
            area: area,
            status: "call"
        };

        currentCalls.push(item);

        io.emit("updateCalls", currentCalls);

    });

    socket.on("confirmCall", () => {

        currentCalls = currentCalls.map(c => {
            return {
                area: c.area,
                status: "confirm"
            };
        });

        io.emit("updateCalls", currentCalls);

        setTimeout(() => {

            currentCalls = [];

            io.emit("updateCalls", currentCalls);

        }, 30000);

    });

    socket.on("cancelCall", () => {

        currentCalls = [];

        io.emit("cancelCall");

    });

});

server.listen(process.env.PORT || 3000, () => {

    console.log("서버 실행중");

});