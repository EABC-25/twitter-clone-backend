import express from "express";

import {
  register,
  verifyEmail,
  login,
  logout,
} from "../controllers/auth.controller";
import protect from "../middlewares/auth/protect";
import limiter from "../middlewares/ratelimit/limiter";

const router = express.Router();

router.post("/register", limiter, register);
router.post("/login", limiter, login);
router.post("/logout", protect, limiter, logout);

// router.post("/verifyEmail", limiter, verifyEmail);

export default router;
