const express = require("express");
const serverless = require("serverless-http");
const session = require("express-session");
const cors = require("cors");
const connectDB = require("./utils/connectDB");
const dotenv = require("dotenv");
dotenv.config();
require("isomorphic-fetch");
const mainRoutes = require("../src/routes/mainRoutes");

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "https://mtodo-utility.netlify.app",
        "https://mtodo-utility.netlify.app/",
        "https://todo-utility.netlify.app",
        "https://todo-utility.netlify.app/",
        "http://localhost:5173",
        // Include your local development URL if needed
        "http://localhost:5173",
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
connectDB();

// Use route files
app.use("/.netlify/functions/api", mainRoutes);
app.use("/test", (req, res) => {
  res.json({ message: "Hello World" });
});

module.exports.handler = serverless(app);
