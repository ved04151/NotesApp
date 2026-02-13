import express from "express";
import { register, login, logout } from "../controllers/auth.controller.js";
import {protect} from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

// Protected route test
router.get("/profile", protect, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

export default router;