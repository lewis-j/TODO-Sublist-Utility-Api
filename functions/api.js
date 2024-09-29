const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const cookieParser = require("cookie-parser");
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
        "https://todo-utility.netlify.app",
        "http://localhost:5173",
      ];
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Connect to MongoDB
connectDB();

// Use route files
app.use("/.netlify/functions/api", mainRoutes);

// Export the serverless function
module.exports.handler = serverless(app);
