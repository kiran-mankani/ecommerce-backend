import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  signupUser,
  verifyOtpService,
  loginUser,
  resendOtpService,
  forgotPasswordService,
  resetPasswordService,
  logoutUser,
} from "../services/authService.js";

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const data = await signupUser({ name, email, password });
  res
    .status(201)
    .json(new ApiResponse(201, data, "Signup successful. Please verify your email."));
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const data = await verifyOtpService({ email, otp });
  res.status(200).json(new ApiResponse(200, data, "Email verified successfully"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const data = await loginUser({ email, password });
  res.status(200).json(new ApiResponse(200, data, "Login successful"));
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await resendOtpService({ email });
  res.status(200).json(new ApiResponse(200, data, "OTP resent successfully"));
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const data = await forgotPasswordService({ email });
  res.status(200).json(new ApiResponse(200, data, "Reset OTP sent"));
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const data = await resetPasswordService({ email, otp, newPassword });
  res.status(200).json(new ApiResponse(200, data, "Password reset successful"));
});

export const logout = asyncHandler(async (req, res) => {
  const data = logoutUser();
  res.status(200).json(new ApiResponse(200, data, "Logged out"));
});