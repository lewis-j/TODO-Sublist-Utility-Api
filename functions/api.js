const express = require("express");
const serverless = require("serverless-http");

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello from the API root!" });
});

app.get("/test", (req, res) => {
  res.json({ message: "Hello from the test route!" });
});

app.use("*", (req, res) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports.handler = serverless(app);
