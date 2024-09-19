const mongoose = require("mongoose");

let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    console.log("Using existing database connection");
    return;
  }

  if (!process.env.MONGODB_DATABASE) {
    throw new Error("MONGODB_DATABASE environment variable is not defined");
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_DATABASE, {
      // Remove deprecated options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    isConnected = db.connections[0].readyState;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
