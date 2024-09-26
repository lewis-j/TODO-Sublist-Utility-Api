const express = require("express");
const serverless = require("serverless-http");

const app = express();

// Logging middleware
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

app.get("/.netlify/functions/api", (req, res) => {
  console.log("Root route hit");
  res.json({ message: "Hello from the API root!" });
});

app.get("/.netlify/functions/api/test", (req, res) => {
  console.log("Test route hit");
  res.json({ message: "Hello from the test route!" });
});

app.use("*", (req, res) => {
  console.log(`404 for ${req.url}`);
  res.status(404).json({ error: "Not Found", path: req.url });
});

module.exports.handler = serverless(app);
