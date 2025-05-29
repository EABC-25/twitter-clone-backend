import express from "express";

import { endPointTest } from "../controllers/test.controller";
import protect from "../middlewares/auth/protect";
import limiter from "../middlewares/ratelimit/limiter";

const router = express.Router();

// test route
router.get("/endpointTest", limiter, endPointTest);

export default router;
