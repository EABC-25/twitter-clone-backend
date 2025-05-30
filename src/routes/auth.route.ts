import express from "express";

import {
  register,
  verifyEmail,
  login,
  logout,
} from "../controllers/auth.controller";
import protect from "../middlewares/auth/protect";
import { authLimiter, userLimiter } from "../middlewares/ratelimit/limiter";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", protect, userLimiter, logout);

// router.post("/verifyEmail", limiter, verifyEmail);

export default router;
