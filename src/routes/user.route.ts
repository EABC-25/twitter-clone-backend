import express from "express";

import {
  getUserWithToken,
  getUserWithUserName,
  deleteUser,
  updateUserProfile,
  getUserFollows,
  updateUserFollows,
  getUsersForSearch,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

// router.get("/getUsers", getUsers);
// router.get("/getUser/test", getUserTest);
router.get("/getUserWithToken", protect, getUserWithToken);
router.get("/getUserWithUserName", protect, getUserWithUserName);
router.delete("/deleteUser", protect, deleteUser);
router.patch("/updateUserProfile", protect, updateUserProfile);
router.post("/follow", protect, updateUserFollows);
router.get("/getUserFollows", protect, getUserFollows);
router.get("/search", protect, getUsersForSearch);

export default router;
