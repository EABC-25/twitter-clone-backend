import express from "express";

import { getMediaUploadSign, getPosts } from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getMediaUploadSign", getMediaUploadSign);
router.get("/getPosts", protect, getPosts);

export default router;
