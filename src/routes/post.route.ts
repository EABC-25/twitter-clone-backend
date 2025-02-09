import express from "express";

import { getPosts } from "../controllers/post.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getPosts", protect, getPosts);

export default router;
