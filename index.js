const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
require("isomorphic-fetch");

const authRoutes = require("./src/routes/authRoutes");
const listRoutes = require("./src/routes/listRoutes");

const app = express();
const port = 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(
  session({
    secret: "your-secret-key",
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
app.get("/test", (req, res) => {
  res.json({ message: "Hello World" });
});
app.use("/auth", authRoutes);
app.use("/", listRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
