import express from "express";

import {
  getMediaUploadSign,
  getPosts,
  addPost,
} from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", /* protect, */ getMediaUploadSign);
router.get("/getPosts", protect, getPosts);
router.post("/addPost", /* protect, */ addPost);

export default router;
