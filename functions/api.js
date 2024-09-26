const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./utils/connectDB");
const dotenv = require("dotenv");
dotenv.config();
require("isomorphic-fetch");

const authRoutes = require("../src/routes/authRoutes");
const listRoutes = require("../src/routes/listRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://mtodo-utility.netlify.app",
        "https://todo-utility.netlify.app",
        "https://deploy-preview-*.netlify.app",
        "http://localhost:5173",
        "https://your-site-name.netlify.app", // Replace with your actual Netlify domain
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// Connect to MongoDB
// connectDB();

// Use route files
app.get("/test", (req, res) => {
  res.json({ message: "Hello World" });
  app.use("*", (req, res) => {
    res.status(404).json({ message: "Route not found", path: req.url });
  });
});
// app.use("/auth", authRoutes);
// app.use("/", listRoutes);

module.exports.handler = serverless(app);
