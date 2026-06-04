const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const defaultStatus = {
    "김은하 실장": "in",
    "이유빈 과장": "in",
    "김나리 과장": "in",
    "박규용 과장": "in"
};

let currentCalls = [];
let userStatus = {};

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

async function initStatusTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS user_status (
            name TEXT PRIMARY KEY,
            status TEXT NOT NULL
        )
    `);

    for (const name of Object.keys(defaultStatus)) {
        await pool.query(
            `
            INSERT INTO user_status (name, status)
            VALUES ($1, $2)
            ON CONFLICT (name) DO NOTHING
            `,
            [name, defaultStatus[name]]
        );
    }
}

async function loadStatus() {
    const result = await pool.query("SELECT name, status FROM user_status");

    const status = {};

    result.rows.forEach(row => {
        status[row.name] = row.status;
    });

    return status;
}

async function saveStatus(name, status) {
    await pool.query(
        `
        INSERT INTO user_status (name, status)
        VALUES ($1, $2)
        ON CONFLICT (name)
        DO UPDATE SET status = EXCLUDED.status
        `,
        [name, status]
    );
}

io.on("connection", (socket) => {

    socket.emit("updateCalls", currentCalls);
    socket.emit("updateStatus", userStatus);

    socket.on("setStatus", async (data) => {
        try {
            userStatus[data.name] = data.status;

            await saveStatus(data.name, data.status);

            io.emit("updateStatus", userStatus);
        } catch (e) {
            console.log("상태 저장 실패:", e);
        }
    });

    socket.on("callBell", (area) => {

        if (userStatus[area] === "out" || userStatus[area] === "leave") {
            io.emit("absentCall", {
                area: area,
                status: userStatus[area]
            });

            return;
        }

        const exist = currentCalls.find(c => c.area === area);

        if (exist) {
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

async function startServer() {
    try {
        await initStatusTable();

        userStatus = await loadStatus();

        server.listen(process.env.PORT || 3000, () => {
            console.log("서버 실행중");
        });
    } catch (e) {
        console.log("서버 시작 실패:", e);
    }
}

startServer();