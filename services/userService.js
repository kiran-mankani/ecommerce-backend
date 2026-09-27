import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

/**
 * Get current user's full profile
 */
export const getMyProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, "User not found");
  return user.toSafeObject();
};

/**
 * Update allowed profile fields.
 * Email, role, isVerified, password, name are NOT updatable here.
 */
export const updateMyProfile = async (userId, payload) => {
  const allowed = [
    "phone",
    "address",
    "city",
    "country",
    "profileImage",
    "bio",
    "language",
  ];
  const updates = {};

  for (const key of allowed) {
    if (payload[key] !== undefined) {
      updates[`profile.${key}`] = String(payload[key]).trim();
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new ApiError(400, "No valid profile fields to update");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  );

  if (!user) throw new ApiError(404, "User not found");
  return user.toSafeObject();
};

/**
 * Change password — uses save() so Phase 2 pre-save hook re-hashes.
 */
export const changeMyPassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId).select("+password");
  if (!user) throw new ApiError(404, "User not found");

  const isMatch = await user.comparePassword(oldPassword);
  if (!isMatch) throw new ApiError(400, "Current password is incorrect");

  if (oldPassword === newPassword) {
    throw new ApiError(
      400,
      "New password must be different from current password"
    );
  }

  user.password = newPassword;
  await user.save();

  return { message: "Password updated successfully" };
};