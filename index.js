const { spawn } = require("node:child_process");
const express = require("express");
const app = express();
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);

const path = require("node:path");

let audioProcess;
let alarmState = "off";

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
})

io.on("connection", (socket) => {
  socket.emit("state", alarmState);
  socket.on("alarm", () => {
    alarmState = alarmState == "on" ? "off" : "on";
    if(alarmState == "on") {
      spawn("termux-volume", ["music", "50"]);
      audioProcess = spawn("ffplay", ["alarm.wav", "-loop", "0", "-autoexit"]);
    } else {
      if(audioProcess) {
        audioProcess.kill();
        audioProcess = "";
      }
    }
    socket.emit("state", alarmState);
  })
})

server.listen(3000);
