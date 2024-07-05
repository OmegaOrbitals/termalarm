const { spawn } = require("node:child_process");
const express = require("express");
const app = express();
const path = require("node:path");

let audioProcess;

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.resolve("index.html"));
})

app.post("/alarm", (req, res) => {
  if(req.body.alarm == "on") {
    spawn("termux-volume", ["music", "100"]);
    audioProcess = spawn("ffplay", ["alarm.wav", "-loop", "0", "-autoexit"]);
  } else {
    audioProcess.kill();
  }
})

app.listen(3000);
