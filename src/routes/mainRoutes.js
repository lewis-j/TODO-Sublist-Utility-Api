import express from "express";
import authRoutes from "./authRoutes.js";
import listRoutes from "./listRoutes.js";

const mainRoutes = express.Router();
mainRoutes.use("/auth", authRoutes);
mainRoutes.use("/", listRoutes);

module.exports = mainRoutes;
