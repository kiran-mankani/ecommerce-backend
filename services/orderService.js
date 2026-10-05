import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import ApiError from "../utils/ApiError.js";

export const createOrder = async (userId, { shippingAddress = {} } = {}) => {
  console.log("╔═══════════════════════════════════════");
  console.log("║ 📦 createOrder called");
  console.log("║ 👤 userId:", userId, "| type:", typeof userId);
  console.log("║ 📬 shippingAddress:", JSON.stringify(shippingAddress));

  // 🔑 CRITICAL: Validate userId format BEFORE using it in queries
  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    console.error("║ ❌ Invalid userId:", userId);
    console.log("╚═══════════════════════════════════════");
    throw new ApiError(400, `Invalid userId: ${userId}`);
  }

  // 🔑 Convert to ObjectId to be 100% safe
  const userObjectId = new mongoose.Types.ObjectId(String(userId));

  // ---------- 1. Find cart ----------
  const cart = await Cart.findOne({ userId: userObjectId });
  console.log("║ 🛒 Cart found:", cart ? "yes" : "no");
  console.log("║ 🛒 Cart items:", cart?.items?.length || 0);

  if (!cart || !cart.items || cart.items.length === 0) {
    console.log("╚═══════════════════════════════════════");
    throw new ApiError(400, "Your cart is empty");
  }

  // ---------- 2. Validate product IDs ----------
  const productIds = cart.items
    .map((i) => i.productId)
    .filter((id) => id && mongoose.Types.ObjectId.isValid(String(id)));

  console.log("║ 🔍 Valid productIds:", productIds.length);

  if (productIds.length === 0) {
    console.log("╚═══════════════════════════════════════");
    throw new ApiError(400, "Cart contains invalid product IDs");
  }

  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const orderItems = [];
  let subtotal = 0;
  let discountTotal = 0;

  // ---------- 3. Validate stock ----------
  for (const item of cart.items) {
    const p = byId.get(String(item.productId));
    if (!p) {
      console.log("║ ❌ Product missing:", item.productId);
      console.log("╚═══════════════════════════════════════");
      throw new ApiError(400, "A product in your cart no longer exists");
    }
    if (p.status !== "active") {
      console.log("║ ❌ Product not active:", p.name);
      console.log("╚═══════════════════════════════════════");
      throw new ApiError(400, `${p.name} is no longer available`);
    }
    if (p.stock < item.quantity) {
      console.log("║ ❌ Insufficient stock:", p.name, p.stock, "<", item.quantity);
      console.log("╚═══════════════════════════════════════");
      throw new ApiError(400, `Only ${p.stock} left in stock for ${p.name}`);
    }

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
  console.log("║ 💰 Total:", total);

  // ---------- 4. Create the order ----------
  const order = await Order.create({
    userId: userObjectId,
    items: orderItems,
    subtotal: +subtotal.toFixed(2),
    discount: +discountTotal.toFixed(2),
    total,
    shippingAddress: {
      name: shippingAddress?.name || "",
      phone: shippingAddress?.phone || "",
      address: shippingAddress?.address || "",
      city: shippingAddress?.city || "",
      country: shippingAddress?.country || "",
    },
    orderStatus: "pending",
    paymentStatus: "paid",
  });
  console.log("║ ✅ Order created:", order._id);

  // ---------- 5. Decrement stock ----------
  const decremented = [];
  for (const it of orderItems) {
    const updated = await Product.findOneAndUpdate(
      { _id: it.productId, stock: { $gte: it.quantity } },
      { $inc: { stock: -it.quantity } },
      { new: true }
    );

    if (!updated) {
      await Order.findByIdAndDelete(order._id);
      console.log("║ ❌ Race condition:", it.productName);
      console.log("╚═══════════════════════════════════════");
      throw new ApiError(
        409,
        `"${it.productName}" just went out of stock. Please refresh your cart.`
      );
    }

    decremented.push({
      productId: updated._id,
      name: updated.name,
      newStock: updated.stock,
    });

    console.log(`║ 📦 Stock: ${updated.name} → ${updated.stock}`);
  }

  // ---------- 6. Clear cart ----------
  cart.items = [];
  await cart.save();
  console.log("║ 🧹 Cart cleared");

  console.log("╚═══════════════════════════════════════");

  // ---------- 7. Return ----------
  return {
    order: order.toObject(),
    updatedProducts: decremented,
  };
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