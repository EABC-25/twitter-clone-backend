import express from "express";

import {
  getMediaUploadSign,
  getHomePosts,
  addPost,
  deletePost,
  getPost,
  getUserPosts,
  updatePostLikes,
  addReply,
  getPostReplies,
  getReply,
  updateReplyLikes,
  deleteReply,
} from "../controllers/post.controller";
import protect from "../middlewares/auth/protect";
import { userLimiter } from "../middlewares/ratelimit/limiter";
const router = express.Router();

router.get("/getMediaUploadSign", protect, userLimiter, getMediaUploadSign);
router.get("/getHomePosts", protect, userLimiter, getHomePosts);
router.get("/getPost", protect, userLimiter, getPost);
router.get("/getUserPosts", protect, userLimiter, getUserPosts);
router.post("/addPost", protect, userLimiter, addPost);
router.delete("/deletePost", protect, userLimiter, deletePost);
router.put("/likePost", protect, userLimiter, updatePostLikes);
router.post("/addReply", protect, userLimiter, addReply);
router.get("/getPostReplies", protect, userLimiter, getPostReplies);
router.post("/getMorePostReplies", protect, userLimiter, getPostReplies);
router.get("/getReply", protect, userLimiter, getReply);
router.delete("/deleteReply", protect, userLimiter, deleteReply);
router.put("/likeReply", protect, userLimiter, updateReplyLikes);

export default router;
