const express = require("express");
const serverless = require("serverless-http");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const cors = require("cors");
const connectDB = require("./utils/connectDB");
const mongoose = require("mongoose");
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

// Connect to MongoDB and set up the app only after successful connection
const setupApp = async () => {
  await connectDB();

  // Set up session with MongoDB store
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        client: mongoose.connection.getClient(),
        ttl: 14 * 24 * 60 * 60, // = 14 days. Default
      }),
      cookie: {
        secure: process.env.NODE_ENV === "production", // Only use secure in production
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      },
    })
  );

  // Use route files
  app.use("/.netlify/functions/api", mainRoutes);
  app.use("/test", (req, res) => {
    res.json({ message: "Hello World" });
  });

  return app;
};

// Export the serverless function
module.exports.handler = async (event, context) => {
  try {
    const app = await setupApp();
    const handler = serverless(app);
    return handler(event, context);
  } catch (error) {
    console.error("Error in serverless function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
