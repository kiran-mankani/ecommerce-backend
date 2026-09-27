import express from "express";
import {
  signupUser, verifyOtpService, loginUser,
  resendOtpService, forgotPasswordService,
  resetPasswordService, logoutUser,
} from "../services/authService.js"; // adjust path
import {
  refreshTokens, logoutRefresh, logoutAll,
} from "../services/authRefreshService.js";           // NEW
import { protect } from "../middleware/authMiddleware.js"; // NEW

const router = express.Router();

router.post("/signup", async (req, res, next) => {
  try {
    const result = await signupUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/verify-otp", async (req, res, next) => {
  try {
    const result = await verifyOtpService(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/login", async (req, res, next) => {
  try {
    const result = await loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/resend-otp", async (req, res, next) => {
  try {
    const result = await resendOtpService(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/forgot-password", async (req, res, next) => {
  try {
    const result = await forgotPasswordService(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/reset-password", async (req, res, next) => {
  try {
    const result = await resetPasswordService(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/logout", (req, res) => {
  res.json({ success: true, data: logoutUser() });
});

// ---------- Phase 6: refresh token routes ---------- (all NEW)

router.post("/refresh", async (req, res, next) => {
  try {
    const result = await refreshTokens(req.body, req);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/logout-refresh", async (req, res, next) => {
  try {
    const result = await logoutRefresh(req.body);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

router.post("/logout-all", protect, async (req, res, next) => {
  try {
    const result = await logoutAll(req.user._id);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
});

// ---------- end Phase 6 ----------

export default router;