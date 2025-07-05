import express from "express";

import db from "../db";
import { authLimiter } from "../middlewares/ratelimit/limiter";

const router = express.Router();

router.get("/health", authLimiter, async (req, res) => {
  try {
    const [rows] = await db.getPool().query("SELECT 1 + 1 AS result");
    res.status(200).json({ success: true, db: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

export default router;
