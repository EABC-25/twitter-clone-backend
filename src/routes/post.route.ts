import express from "express";

import {
  getMediaUploadSign,
  getHomePosts,
  addPost,
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", /* protect, */ getMediaUploadSign);
router.get("/getHomePosts", protect, getHomePosts);
router.post("/addPost", protect, addPost);

export default router;
