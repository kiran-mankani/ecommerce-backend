import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "../services/userService.js";

export const getMe = asyncHandler(async (req, res) => {
  const data = await getMyProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Profile fetched"));
});

export const getProfile = asyncHandler(async (req, res) => {
  const data = await getMyProfile(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Profile fetched"));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const data = await updateMyProfile(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, data, "Profile updated"));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const data = await changeMyPassword(req.user._id, oldPassword, newPassword);
  res.status(200).json(new ApiResponse(200, data, "Password changed"));
});

export const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client removes token. Backend just confirms.
  res.status(200).json(new ApiResponse(200, {}, "Logged out"));
});