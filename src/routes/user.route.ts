import express from "express";

import { getUsers, deleteUser } from "../controllers/user.controller";

const router = express.Router();

router.get("/getUsers", getUsers);
router.delete("/deleteUser", deleteUser);

export default router;
