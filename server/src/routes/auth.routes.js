import { Router } from "express";
import {
  register,
  verifyEmail,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  resendOTP,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

import { upload } from "../middleware/upload.middleware.js";

const router = Router();

// Public routes
router.post(
  "/register",
  upload.fields([
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 },
  ]),
  register
);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOTP);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Cookie-based — no Bearer token needed
router.post("/refresh", refresh);

// Protected
router.post("/logout", protect, logout);

export default router;
