const express = require("express");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const STATUS_FILE = path.join(__dirname, "status.json");

const defaultStatus = {
    "김은하 실장": "in",
    "이유빈 과장": "in",
    "김나리 과장": "in",
    "박규용 과장": "in"
};

function loadStatus(){
    try{
        if(fs.existsSync(STATUS_FILE)){
            return JSON.parse(fs.readFileSync(STATUS_FILE, "utf8"));
        }
    }catch(e){
        console.log("상태 불러오기 실패");
    }

    return defaultStatus;
}

function saveStatus(){
    fs.writeFileSync(
        STATUS_FILE,
        JSON.stringify(userStatus, null, 2),
        "utf8"
    );
}

let currentCalls = [];
let userStatus = loadStatus();

io.on("connection", (socket) => {

    socket.emit("updateCalls", currentCalls);
    socket.emit("updateStatus", userStatus);

    socket.on("setStatus", (data) => {

        userStatus[data.name] = data.status;
        saveStatus();

        io.emit("updateStatus", userStatus);

    });

    socket.on("callBell", (area) => {

        if(userStatus[area] === "out" || userStatus[area] === "leave"){

            io.emit("absentCall", {
                area: area,
                status: userStatus[area]
            });

            return;
        }

        const exist = currentCalls.find(c => c.area === area);

        if(exist){
            return;
        }

        currentCalls.push({
            area: area,
            status: "call"
        });

        io.emit("updateCalls", currentCalls);

    });

    socket.on("confirmCall", () => {

        currentCalls = currentCalls.map(c => ({
            area: c.area,
            status: "confirm"
        }));

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