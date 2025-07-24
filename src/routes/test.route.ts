import express from "express";

import { endPointTest } from "../controllers/test.controller";
import protect from "../middlewares/auth/protect";
import { authLimiter } from "../middlewares/ratelimit/limiter";
import { register } from "src/controllers/auth.controller";
import {
  getUserFromTokenTest,
  getUserWithUserNameTest,
} from "src/controllers/user.controller";

const router = express.Router();

// test route
router.post("/endpointTest", authLimiter, endPointTest);

export default router;
