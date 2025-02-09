import express from "express";

import { getUsers, getUser, deleteUser } from "../controllers/user.controller";
import { protect } from "../middlewares/auth/auth";

const router = express.Router();

router.get("/getUsers", getUsers);
router.get("/getUser", protect, getUser);
router.delete("/deleteUser", deleteUser);

export default router;
