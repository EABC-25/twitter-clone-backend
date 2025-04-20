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
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", protect, getMediaUploadSign);
router.get("/getHomePosts", protect, getHomePosts);
router.get("/getPost", protect, getPost);
router.get("/getUserPosts", protect, getUserPosts);
router.post("/addPost", protect, addPost);
router.delete("/deletePost", protect, deletePost);
router.put("/likePost", protect, updatePostLikes);
router.post("/addReply", protect, addReply);
router.get("/getPostReplies", protect, getPostReplies);
router.get("/getReply", protect, getReply);
router.put("/likeReply", protect, updateReplyLikes);

export default router;
