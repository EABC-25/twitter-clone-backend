import express from "express";

import {
  getUsers,
  getUser,
  getUserTest,
  getUserName,
  deleteUser,
  updateUserProfile,
  getUserFollows,
  updateUserFollows,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getUsers", getUsers);
router.get("/getUser", protect, getUser);
router.get("/getUser/test", getUserTest);
router.get("/getUserName", protect, getUserName);
router.delete("/deleteUser", protect, deleteUser);
router.patch("/updateUserProfile", protect, updateUserProfile);
router.post("/follow", protect, updateUserFollows);
router.get("/getUserFollows", getUserFollows);

export default router;
