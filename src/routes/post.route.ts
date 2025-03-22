import express from "express";

import {
  getMediaUploadSign,
  getHomePosts,
  addPost,
  getPost,
  getUserPosts,
  updateLikes,
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", protect, getMediaUploadSign);
router.get("/getHomePosts", protect, getHomePosts);
router.get("/getPost", protect, getPost);
router.get("/getUserPosts", protect, getUserPosts);
router.post("/addPost", protect, addPost);
router.put("/like", protect, updateLikes);

export default router;
