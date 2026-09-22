import express from "express";
import {
  signupUser, verifyOtpService, loginUser,
  resendOtpService, forgotPasswordService,
  resetPasswordService, logoutUser,
} from "../services/authService.js"; // adjust path

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

export default router;