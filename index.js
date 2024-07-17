const { spawn } = require("node:child_process");
const express = require("express");
const app = express();
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const server = createServer(app);
const io = new Server(server);
const path = require("node:path");

let processes = {};
let states = {
  alarm: "off",
  torch: "off"
}

function handleButton(type) {
  if(type == "alarm") {
    if(states[type] == "on") {
      spawn("termux-volume", ["music", "100"]);
      processes[type] = spawn("ffplay", ["alarm.wav", "-loop", "0", "-af", "volume=4.0", "-autoexit"]);
    } else if(processes[type]) {
      processes[type].kill();
      processes[type] = "";
    }
  } else if(states[type] == "torch") {
    spawn("termux-torch", states[type]);
  }
}

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
})

io.on("connection", (socket) => {
  socket.emit("states", states);
  socket.on("button", (type) => {
    states[type] = states[type] == "on" ? "off" : "on";
    handleButton(type);
    socket.emit("state", type, states[type]);
  })
})

server.listen(3000);
