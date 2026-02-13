// console.log("server starting...");

import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import noteRoutes from "./routes/note.routes.js";
import authRoutes from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";

const app = express();

dotenv.config();

// Middleware
app.use(express.json());
app.use(cookieParser());

// Database connect kar rahe hain
connectDB();

// Notes routes connect kar rahe hain
app.use("/api/notes", noteRoutes);
app.use("/api/auth", authRoutes);

// // Routes
// app.get("/", (req, res) =>{
//     res.send("Api is running...");
// })



const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>{
    console.log(`Server is running on PORT ${PORT}`);
})