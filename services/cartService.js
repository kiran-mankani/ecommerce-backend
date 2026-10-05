import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import mongoose from "mongoose";

/* ------------------------------------------------------------
   Get or create cart — ALWAYS uses ObjectId
   ------------------------------------------------------------ */
const getOrCreateCart = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new ApiError(400, `Invalid userId: ${userId}`);
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));

  let cart = await Cart.findOne({ userId: userObjectId });

  if (!cart) {
    cart = await Cart.create({ userId: userObjectId, items: [] });
    console.log("🆕 New cart created for user:", String(userId));
  }

  return cart;
};

/* ------------------------------------------------------------
   Build response for frontend
   ------------------------------------------------------------ */
const buildCartResponse = async (cart) => {
  const ids = cart.items.map((i) => i.productId).filter(Boolean);
  if (ids.length === 0) {
    return {
      _id: cart._id,
      userId: cart.userId,
      items: [],
      subtotal: 0,
      discount: 0,
      total: 0,
      count: 0,
    };
  }

  const products = await Product.find({ _id: { $in: ids } }).populate(
    "categoryId",
    "name"
  );
  const prodById = new Map(products.map((p) => [String(p._id), p]));

  const items = [];
  let subtotal = 0;
  let discountTotal = 0;

  for (const it of cart.items) {
    const p = prodById.get(String(it.productId));
    if (!p) continue;

    const price = p.price;
    const discountAmount = (price * (p.discount || 0)) / 100;
    const lineTotal = (price - discountAmount) * it.quantity;

    subtotal += price * it.quantity;
    discountTotal += discountAmount * it.quantity;

    items.push({
      productId: p._id,
      name: p.name,
      price: p.price,
      discount: p.discount || 0,
      finalPrice: +(price - discountAmount).toFixed(2),
      image: p.images?.[0] || "",
      stock: p.stock,
      quantity: it.quantity,
      lineTotal: +lineTotal.toFixed(2),
      categoryId: p.categoryId,
    });
  }

  const total = +(subtotal - discountTotal).toFixed(2);

  return {
    _id: cart._id,
    userId: cart.userId,
    items,
    subtotal: +subtotal.toFixed(2),
    discount: +discountTotal.toFixed(2),
    total,
    count: items.reduce((s, i) => s + i.quantity, 0),
  };
};

/* ------------------------------------------------------------
   GET CART
   ------------------------------------------------------------ */
export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return buildCartResponse(cart);
};

/* ------------------------------------------------------------
   ADD TO CART
   ------------------------------------------------------------ */
export const addToCart = async (userId, { productId, quantity = 1 }) => {
  console.log("╔══ addToCart HIT");
  console.log("║ userId:", userId);
  console.log("║ productId:", productId);
  console.log("║ quantity:", quantity);

  // ---- Validate IDs ----
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new ApiError(400, `Invalid userId: ${userId}`);
  }
  if (!mongoose.Types.ObjectId.isValid(String(productId))) {
    throw new ApiError(400, `Invalid productId: ${productId}`);
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));
  const productObjectId = new mongoose.Types.ObjectId(String(productId));
  const qty = Math.max(1, parseInt(quantity, 10) || 1);

  // ---- Verify product ----
  const product = await Product.findById(productObjectId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.status !== "active") throw new ApiError(400, "Not available");
  if (product.stock <= 0) throw new ApiError(400, "Out of stock");

  // ---- Get or create the cart ----
  const cart = await getOrCreateCart(userObjectId);
  console.log("║ 📦 Cart before:", cart.items.length, "items");

  // ---- Find existing item ----
  const idx = cart.items.findIndex(
    (i) => String(i.productId) === String(productObjectId)
  );

  if (idx >= 0) {
    // 🔼 Increment
    const newQty = cart.items[idx].quantity + qty;
    if (newQty > product.stock) {
      throw new ApiError(400, `Only ${product.stock} left in stock`);
    }

    const result = await Cart.updateOne(
      { _id: cart._id, "items.productId": productObjectId },
      { $set: { "items.$.quantity": newQty } }
    );

    console.log(
      `║ 🔼 updateOne — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`
    );

    if (result.matchedCount === 0) {
      console.warn("║ ⚠️ Item not found in cart during update");
    }
  } else {
    // ➕ Push
    if (qty > product.stock) {
      throw new ApiError(400, `Only ${product.stock} left in stock`);
    }

    const result = await Cart.updateOne(
      { _id: cart._id },
      {
        $push: {
          items: { productId: productObjectId, quantity: qty },
        },
      }
    );

    console.log(
      `║ ➕ updateOne — matched: ${result.matchedCount}, modified: ${result.modifiedCount}`
    );

    if (result.matchedCount === 0) {
      throw new ApiError(500, "Failed to update cart");
    }
  }

  // ---- Reload and verify ----
  const updated = await Cart.findById(cart._id);
  console.log("║ 📦 Cart after:", updated.items.length, "items");
  console.log(
    "║ 📦 Items:",
    updated.items.map((i) => `${i.productId} x${i.quantity}`).join(", ")
  );
  console.log("╚══");

  return buildCartResponse(updated);
};

/* ------------------------------------------------------------
   UPDATE ITEM QUANTITY
   ------------------------------------------------------------ */
export const updateCartItem = async (userId, productId, quantity) => {
  if (
    !mongoose.Types.ObjectId.isValid(String(userId)) ||
    !mongoose.Types.ObjectId.isValid(String(productId))
  ) {
    throw new ApiError(400, "Invalid IDs");
  }

  const qty = parseInt(quantity, 10);
  if (!qty || qty < 1) throw new ApiError(400, "Quantity must be ≥ 1");

  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (qty > product.stock) {
    throw new ApiError(400, `Only ${product.stock} left in stock`);
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));
  const productObjectId = new mongoose.Types.ObjectId(String(productId));

  const result = await Cart.updateOne(
    { userId: userObjectId, "items.productId": productObjectId },
    { $set: { "items.$.quantity": qty } }
  );

  if (result.matchedCount === 0) {
    throw new ApiError(404, "Item not in cart");
  }

  const cart = await Cart.findOne({ userId: userObjectId });
  return buildCartResponse(cart);
};

/* ------------------------------------------------------------
   REMOVE ITEM
   ------------------------------------------------------------ */
export const removeCartItem = async (userId, productId) => {
  if (
    !mongoose.Types.ObjectId.isValid(String(userId)) ||
    !mongoose.Types.ObjectId.isValid(String(productId))
  ) {
    throw new ApiError(400, "Invalid IDs");
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));
  const productObjectId = new mongoose.Types.ObjectId(String(productId));

  await Cart.updateOne(
    { userId: userObjectId },
    { $pull: { items: { productId: productObjectId } } }
  );

  const cart = await Cart.findOne({ userId: userObjectId });
  return buildCartResponse(cart);
};

/* ------------------------------------------------------------
   CLEAR CART
   ------------------------------------------------------------ */
export const clearCart = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(String(userId))) {
    throw new ApiError(400, `Invalid userId: ${userId}`);
  }

  const userObjectId = new mongoose.Types.ObjectId(String(userId));

  await Cart.updateOne({ userId: userObjectId }, { $set: { items: [] } });

  const cart = await Cart.findOne({ userId: userObjectId });

  if (!cart) {
    return { items: [], subtotal: 0, discount: 0, total: 0, count: 0 };
  }

  return buildCartResponse(cart);
};