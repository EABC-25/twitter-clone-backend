import express from "express";

import {
  getMediaUploadSign,
  getHomePosts,
  addPost,
  getPost,
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", protect, getMediaUploadSign);
router.get("/getHomePosts", protect, getHomePosts);
router.get("/getPost", protect, getPost);
router.post("/addPost", protect, addPost);

export default router;
