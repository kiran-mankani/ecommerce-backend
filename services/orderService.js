import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

/**
 * Create an order from the user's current cart.
 * Flow:
 *   1. Load cart
 *   2. Validate cart non-empty
 *   3. Load all products, verify stock and active status
 *   4. Snapshot items with current prices
 *   5. Compute totals
 *   6. Create order
 *   7. Decrement stock
 *   8. Clear cart
 */
export const createOrder = async (userId, { shippingAddress }) => {
  const cart = await Cart.findOne({ userId });
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Your cart is empty");
  }

  const productIds = cart.items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let subtotal = 0;
  let discountTotal = 0;

  for (const item of cart.items) {
    const p = byId.get(String(item.productId));
    if (!p) throw new ApiError(400, "A product in your cart no longer exists");
    if (p.status !== "active")
      throw new ApiError(400, `"${p.name}" is no longer available`);
    if (p.stock < item.quantity)
      throw new ApiError(400, `Only ${p.stock} in stock for "${p.name}"`);

    const price = p.price;
    const discountAmount = (price * (p.discount || 0)) / 100;
    const lineTotal = (price - discountAmount) * item.quantity;

    subtotal += price * item.quantity;
    discountTotal += discountAmount * item.quantity;

    orderItems.push({
      productId: p._id,
      productName: p.name,
      quantity: item.quantity,
      price: p.price,
      discount: p.discount || 0,
      subtotal: +lineTotal.toFixed(2),
    });
  }

  const total = +(subtotal - discountTotal).toFixed(2);

  const order = await Order.create({
    userId,
    items: orderItems,
    subtotal: +subtotal.toFixed(2),
    discount: +discountTotal.toFixed(2),
    total,
    shippingAddress,
    orderStatus: "pending",
  });

  // Decrement stock (safe: we already validated)
  await Promise.all(
    orderItems.map((it) =>
      Product.updateOne(
        { _id: it.productId },
        { $inc: { stock: -it.quantity } }
      )
    )
  );

  // Clear cart
  cart.items = [];
  await cart.save();

  return order.toObject();
};

export const listMyOrders = async (userId, { page = 1, limit = 10 } = {}) => {
  const pageNum = Math.max(parseInt(page, 10) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 50);

  const total = await Order.countDocuments({ userId });
  const items = await Order.find({ userId })
    .sort({ createdAt: -1 })
    .skip((pageNum - 1) * limitNum)
    .limit(limitNum);

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

export const getMyOrderById = async (userId, orderId) => {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, "Order not found");
  if (String(order.userId) !== String(userId)) {
    throw new ApiError(403, "Not authorized to view this order");
  }
  return order.toObject();
};