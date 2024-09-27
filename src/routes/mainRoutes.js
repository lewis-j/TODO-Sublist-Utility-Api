const express = require("express");
const authRoutes = require("./authRoutes.js");
const listRoutes = require("./listRoutes.js");

const mainRoutes = express.Router();
mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/", listRoutes);

module.exports = mainRoutes;
