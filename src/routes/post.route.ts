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
import limiter from "../middlewares/ratelimit/limiter";

const router = express.Router();

router.get("/getMediaUploadSign", protect, limiter, getMediaUploadSign);
router.get("/getHomePosts", protect, limiter, getHomePosts);
router.get("/getPost", protect, limiter, getPost);
router.get("/getUserPosts", protect, limiter, getUserPosts);
router.post("/addPost", protect, limiter, addPost);
router.delete("/deletePost", protect, limiter, deletePost);
router.put("/likePost", protect, limiter, updatePostLikes);
router.post("/addReply", protect, limiter, addReply);
router.get("/getPostReplies", protect, limiter, getPostReplies);
router.post("/getMorePostReplies", protect, limiter, getPostReplies);
router.get("/getReply", protect, limiter, getReply);
router.delete("/deleteReply", protect, limiter, deleteReply);
router.put("/likeReply", protect, limiter, updateReplyLikes);

export default router;
