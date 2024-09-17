const express = require("express");
const serverless = require("serverless-http");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
require("isomorphic-fetch");

const authRoutes = require("../src/routes/authRoutes");
const listRoutes = require("../src/routes/listRoutes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
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
const mongoDbUrl = process.env.MONGODB_DATABASE;
mongoose
  .connect(mongoDbUrl)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("Could not connect to MongoDB", err);
    process.exit(1);
  });

// Use route files
app.use("/.netlify/functions/api/auth", authRoutes);
app.use("/.netlify/functions/api", listRoutes);

module.exports.handler = serverless(app);
