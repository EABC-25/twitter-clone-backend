import express from "express";

import {
  getUserWithToken,
  getUserWithUserName,
  deleteUser,
  updateUserProfile,
  getUserFollows,
  updateUserFollows,
  getUsersForSearch,
  getUserCount,
} from "../controllers/user.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/count", getUserCount);
router.get("/getUserWithToken", protect, getUserWithToken);
router.get("/getUserWithUserName", protect, getUserWithUserName);
router.delete("/deleteUser", protect, deleteUser);
router.patch("/updateUserProfile", protect, updateUserProfile);
router.post("/follow", protect, updateUserFollows);
router.get("/getUserFollows", protect, getUserFollows);
router.get("/search", protect, getUsersForSearch);

// tests
// router.get("/getUsers", getUsers);
// router.get("/getUser/test", getUserTest);
// router.get("/limits", getUserPostsRepliesLimitsTest);

export default router;
