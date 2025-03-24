import express from "express";

import {
  getUsers,
  getUser,
  getUserTest,
  getUserName,
  deleteUser,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getUsers", getUsers);
router.get("/getUser", protect, getUser);
router.get("/getUser/test", getUserTest);
router.get("/getUserName", protect, getUserName);
router.delete("/deleteUser", deleteUser);

export default router;
