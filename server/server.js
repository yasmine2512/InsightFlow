import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import authRoutes from'./Routes/authRoutes.js';
import dashboardRoutes from './Routes/dashboardRoutes.js';
import ordersRoutes from './Routes/ordersRoutes.js';
import productsRoutes from './Routes/productsRoutes.js';
import subscriptionRoutes from './Routes/subscriptionRoutes.js';
import customersRoutes from './Routes/customersRoutes.js';
import connectDB from "./config/db.js"; 
import passport from "./config/passport.js";

const app = express();

connectDB();
app.use(cors());
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api/subscription",subscriptionRoutes);
app.use(passport.initialize());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/customers",customersRoutes);
app.use("/api/products",productsRoutes);
app.use("/api/orders",ordersRoutes);
app.use("/api/dashboard",dashboardRoutes);
// app.connectdb();
app.use("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});