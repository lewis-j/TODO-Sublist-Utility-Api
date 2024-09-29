const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_DATABASE, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    console.log(
      "MongoDB URI:",
      process.env.MONGODB_DATABASE.replace(/:([^:@]{1,}@)/g, ":****@")
    );
    throw error;
  }
};

module.exports = connectDB;
