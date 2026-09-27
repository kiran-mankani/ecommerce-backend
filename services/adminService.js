import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import { USER_ROLES } from "../constants/index.js";

/**
 * Admin-only stats for the dashboard stub.
 * Full stats will be expanded in Phase 11.
 */
export const getAdminDashboardStats = async () => {
  const [totalUsers, totalAdmins] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.CUSTOMER }),
    User.countDocuments({ role: USER_ROLES.ADMIN }),
  ]);

  return {
    totalCustomers: totalUsers,
    totalAdmins,
    // Placeholders until Phase 6/9 collections exist
    totalProducts: 0,
    totalOrders: 0,
  };
};

/**
 * List all users (admin only).
 * Pagination for future use.
 */
export const listUsers = async ({ page = 1, limit = 10 } = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const total = await User.countDocuments();
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

  return {
    items: users.map((u) => u.toSafeObject()),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum),
    },
  };
};

/**
 * Get a single user by id (admin only).
 */
export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user.toSafeObject();
};