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
import protect from "../middlewares/auth/protect";
import limiter from "../middlewares/ratelimit/limiter";

const router = express.Router();

router.get("/count", limiter, getUserCount);
router.get("/getUserWithToken", protect, limiter, getUserWithToken);
router.get("/getUserWithUserName", protect, limiter, getUserWithUserName);
router.delete("/deleteUser", protect, limiter, deleteUser);
router.patch("/updateUserProfile", protect, limiter, updateUserProfile);
router.post("/follow", protect, limiter, updateUserFollows);
router.get("/getUserFollows", protect, limiter, getUserFollows);
router.get("/search", protect, limiter, getUsersForSearch);

export default router;
