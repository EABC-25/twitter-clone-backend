import express from "express";

import { endPointTest } from "../controllers/test.controller";
import protect from "../middlewares/auth/protect";
import { authLimiter } from "../middlewares/ratelimit/limiter";
import {
  getUserFromTokenTest,
  getUserWithUserNameTest,
} from "src/controllers/user.controller";

const router = express.Router();

// test route
router.get("/endpointTest", authLimiter, endPointTest);

export default router;
