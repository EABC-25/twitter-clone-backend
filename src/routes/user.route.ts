import express from "express";

import {
  getUserFromToken,
  getUserWithUserName,
  deleteUser,
  updateUserProfile,
  getUserFollows,
  updateUserFollows,
  getUsersForSearch,
  getUserCount,
} from "../controllers/user.controller";
import protect from "../middlewares/auth/protect";
import {
  customAuthLimiter,
  authLimiter,
  userLimiter,
} from "../middlewares/ratelimit/limiter";

const router = express.Router();

router.get("/count", authLimiter, getUserCount);

// rate limit for get request without token set at 50 requests within 10 minutes. This is to avoid excessive requests on this endpoint's protect middleware via page refresh
router.get(
  "/getUserWithToken",
  customAuthLimiter(50, 10),
  protect,
  userLimiter,
  getUserFromToken
);

router.get("/getUserWithUserName", protect, userLimiter, getUserWithUserName);
router.delete("/deleteUser", protect, userLimiter, deleteUser);
router.patch("/updateUserProfile", protect, userLimiter, updateUserProfile);
router.post("/follow", protect, userLimiter, updateUserFollows);
router.get("/getUserFollows", protect, userLimiter, getUserFollows);
router.get("/search", protect, userLimiter, getUsersForSearch);

export default router;
