import express from "express";

import {
  checkToken,
  checkEmail,
  register,
  verifyEmail,
  login,
  logout,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/checkToken", protect, checkToken);
router.get("/checkEmail", checkEmail);
router.post("/register", register);
router.post("/verifyEmail", verifyEmail);
router.post("/login", login);
router.post("/logout", protect, logout);
router.post("/sendEmailVerification");

export default router;
