import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.js";
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
  res.status(200).json(new ApiResponse(200, {}, "Logged out"));
});

/**
 * Upload/replace the logged-in user's avatar.
 * File is stored in backend/uploads/avatars/ and served at /uploads/avatars/<file>.
 */
export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "No image uploaded");
  }

  const user = await User.findById(req.user._id);
  if (!user) throw new ApiError(404, "User not found");

  // Public URL the browser can load
  user.profile.profileImage = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  res
    .status(200)
    .json(new ApiResponse(200, user.toSafeObject(), "Avatar uploaded"));
});