import express from "express";

import {
  checkToken,
  checkEmail,
  register,
  verifyEmail,
  login,
} from "../controllers/auth.controller";

const router = express.Router();

router.get("/checkToken", checkToken);
router.get("/checkEmail", checkEmail);
router.post("/register", register);
router.post("/verifyEmail", verifyEmail);
router.post("/login", login);

export default router;
