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

// Wrap the serverless handler in an async function
const handler = async (event, context) => {
  // Connect to MongoDB before handling any requests
  try {
    await connectDB();
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }

  // Use route files
  app.use("/.netlify/functions/api", mainRoutes);

  // Create and return the serverless handler
  const serverlessHandler = serverless(app);
  return serverlessHandler(event, context);
};

// Export the wrapped handler
module.exports.handler = handler;
