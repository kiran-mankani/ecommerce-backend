import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getAdminDashboardStats,
  listUsers,
  getUserById,
} from "../services/adminService.js";

/**
 * GET /api/v1/admin/dashboard
 * Admin only
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const data = await getAdminDashboardStats();
  res.status(200).json(new ApiResponse(200, data, "Dashboard data fetched"));
});

/**
 * GET /api/v1/admin/users?page=1&limit=10
 * Admin only
 */
export const getUsers = asyncHandler(async (req, res) => {
  const data = await listUsers(req.query);
  res.status(200).json(new ApiResponse(200, data, "Users fetched"));
});

/**
 * GET /api/v1/admin/users/:id
 * Admin only
 */
export const getUser = asyncHandler(async (req, res) => {
  const data = await getUserById(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "User fetched"));
});

/**
 * GET /api/v1/admin/me
 * Confirms the caller is an authenticated admin (used by frontend guard)
 */
export const getMe = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(new ApiResponse(200, req.user.toSafeObject(), "Admin verified"));
});