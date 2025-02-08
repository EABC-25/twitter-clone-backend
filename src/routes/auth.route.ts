import express from "express";

import {
  checkToken,
  checkEmail,
  register,
  verifyEmail,
  login,
} from "../controllers/auth.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/checkToken", protect, checkToken);
router.get("/checkEmail", checkEmail);
router.post("/register", register);
router.post("/verifyEmail", verifyEmail);
router.post("/login", login);

export default router;
