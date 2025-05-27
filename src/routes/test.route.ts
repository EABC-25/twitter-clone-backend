import express from "express";

import { endPointTest } from "../controllers/test.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

// test route
router.get("/endpointTest", endPointTest);

export default router;
