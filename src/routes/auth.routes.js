import express from "express";
import { userSignup, userLogin, adminLogin } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", userSignup);
router.post("/login", userLogin);
router.post("/admin/login", adminLogin);

export default router;
