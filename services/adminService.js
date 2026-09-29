import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";
import { USER_ROLES } from "../constants/index.js";

/**
 * Aggregated stats for the admin dashboard.
 * All numbers are computed on the backend.
 */
export const getAdminDashboardStats = async () => {
  const [
    totalCustomers,
    totalAdmins,
    totalProducts,
    activeProducts,
    outOfStockProducts,
    totalOrders,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    revenueAgg,
    recentOrders,
    recentProducts,
    topProductsAgg,
  ] = await Promise.all([
    User.countDocuments({ role: USER_ROLES.CUSTOMER }),
    User.countDocuments({ role: USER_ROLES.ADMIN }),
    Product.countDocuments(),
    Product.countDocuments({ status: "active" }),
    Product.countDocuments({ stock: { $lte: 0 } }),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: "pending" }),
    Order.countDocuments({ orderStatus: "delivered" }),
    Order.countDocuments({ orderStatus: "cancelled" }),

    // Total revenue from non-cancelled orders
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),

    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "name email"),

    Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("categoryId", "name"),

    // Top-selling products by quantity ordered
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.productName" },
          quantity: { $sum: "$items.quantity" },
          revenue: { $sum: "$items.subtotal" },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 5 },
    ]),
  ]);

  const totalRevenue = revenueAgg[0]?.total || 0;

  return {
    totals: {
      customers: totalCustomers,
      admins: totalAdmins,
      products: totalProducts,
      activeProducts,
      outOfStockProducts,
      orders: totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      revenue: +totalRevenue.toFixed(2),
    },
    recentOrders: recentOrders.map((o) => o.toObject()),
    recentProducts: recentProducts.map((p) => p.toObject()),
    topProducts: topProductsAgg.map((t) => ({
      productId: t._id,
      name: t.name,
      quantity: t.quantity,
      revenue: +t.revenue.toFixed(2),
    })),
  };
};

/* ============ EXISTING FUNCTIONS (unchanged) ============ */

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
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getUserById = async (id) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");
  return user.toSafeObject();
};