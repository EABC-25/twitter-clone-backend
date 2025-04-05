import express from "express";

import {
  getMediaUploadSign,
  getHomePosts,
  addPost,
  getPost,
  getUserPosts,
  updateLikes,
  addReply,
  getPostReplies,
  getReply,
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", protect, getMediaUploadSign);
router.get("/getHomePosts", protect, getHomePosts);
router.get("/getPost", protect, getPost);
router.get("/getUserPosts", protect, getUserPosts);
router.post("/addPost", protect, addPost);
router.put("/like", protect, updateLikes);
router.post("/addReply", protect, addReply);
router.get("/getPostReplies", protect, getPostReplies);
router.get("/getReply", protect, getReply);

export default router;
