import express from "express";
import { registerUser, loginUser, googleSignIn, getUserProfile } from "../controller/UserController.js";
import authenticator from "../middleware/auth.js";

const router = express.Router();

router.post("/google-signin", googleSignIn);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", authenticator, getUserProfile); // Correct route

export default router;
