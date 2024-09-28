const express = require("express");
const serverless = require("serverless-http");
const session = require("express-session");
const MongoStore = require("connect-mongo");
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

// Connect to MongoDB
connectDB();

// Set up session with MongoDB store
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_DATABASE,
      ttl: 14 * 24 * 60 * 60, // = 14 days. Default
    }),
    cookie: {
      secure: true, // Always use secure cookies in Netlify Functions
      httpOnly: true, // Helps prevent XSS attacks
      sameSite: "none", // Allows cross-origin cookies
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
    },
  })
);

// Use route files
app.use("/.netlify/functions/api", mainRoutes);
app.use("/test", (req, res) => {
  res.json({ message: "Hello World" });
});

module.exports.handler = serverless(app);
