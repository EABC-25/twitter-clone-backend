import express from "express";

import {
  checkEmail,
  getUsers,
  register,
  deleteUser,
  verifyEmail,
} from "../controllers/user.controller";

const router = express.Router();

router.get("/checkEmail", checkEmail);
router.get("/getUsers", getUsers);
router.post("/register", register);
router.delete("/deleteUser", deleteUser);
router.post("/verifyEmail", verifyEmail);
// router.post("/login", login);

export default router;
