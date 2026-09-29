import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

export const listAllOrders = async ({
  page = 1,
  limit = 10,
  status = "",
  search = "",
} = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);

  const query = {};

  if (
    status &&
    [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ].includes(status)
  ) {
    query.orderStatus = status;
  }

  if (search && search.trim()) {
    const s = search.trim();
    const isObjectId = /^[a-f\d]{24}$/i.test(s);
    const or = [
      { "shippingAddress.name": { $regex: s, $options: "i" } },
      { "shippingAddress.phone": { $regex: s, $options: "i" } },
    ];
    if (isObjectId) or.push({ _id: s });
    query.$or = or;
  }

  const total = await Order.countDocuments(query);
  const items = await Order.find(query)
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum)
    .populate("userId", "name email");

  return {
    items: items.map((o) => o.toObject()),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum) || 1,
    },
  };
};

export const getOrderById = async (orderId) => {
  if (!/^[a-f\d]{24}$/i.test(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }
  const order = await Order.findById(orderId).populate("userId", "name email");
  if (!order) throw new ApiError(404, "Order not found");
  return order.toObject();
};

export const updateOrderStatus = async (orderId, status) => {
  if (!/^[a-f\d]{24}$/i.test(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const allowed = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Invalid status. Allowed: ${allowed.join(", ")}`);
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  order.orderStatus = status;
  await order.save();
  return order.toObject();
};

/**
 * Delete an order permanently.
 */
export const deleteOrder = async (orderId) => {
  if (!/^[a-f\d]{24}$/i.test(orderId)) {
    throw new ApiError(400, "Invalid order id");
  }

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");

  await order.deleteOne();
  return { message: "Order deleted", _id: orderId };
};

/**
 * Order statistics for the admin panel.
 * Counts by status + total revenue (excluding cancelled orders).
 */
export const getOrderStats = async () => {
  const [statusAgg, revenueAgg] = await Promise.all([
    Order.aggregate([
      { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
  ]);

  const counts = {
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  };

  statusAgg.forEach((row) => {
    if (row._id in counts) counts[row._id] = row.count;
  });

  const totalOrders = Object.values(counts).reduce((a, b) => a + b, 0);
  const revenue = +(revenueAgg[0]?.total || 0).toFixed(2);

  return { totalOrders, counts, revenue };
};