const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let currentCalls = [];

let userStatus = {
    "김은하 실장": "in",
    "이유빈 과장": "in",
    "김나리 과장": "in",
    "박규용 과장": "in"
};

io.on("connection", (socket) => {

    socket.emit("updateCalls", currentCalls);
    socket.emit("updateStatus", userStatus);

    socket.on("setStatus", (data) => {

        userStatus[data.name] = data.status;

        io.emit("updateStatus", userStatus);

    });

    socket.on("callBell", (area) => {

        if(userStatus[area] === "out"){

            io.emit("absentCall", {
                area: area
            });

            return;
        }

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