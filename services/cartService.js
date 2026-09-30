import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
};

const buildCartResponse = async (cart) => {
  const ids = cart.items.map((i) => i.productId);
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

export const getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  return buildCartResponse(cart);
};

export const addToCart = async (userId, { productId, quantity = 1 }) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");
  if (product.status !== "active")
    throw new ApiError(400, "Out of stock");
  if (product.stock <= 0)
    throw new ApiError(400, "Out of stock");

  const cart = await getOrCreateCart(userId);
  const idx = cart.items.findIndex(
    (i) => String(i.productId) === String(productId)
  );

  if (idx >= 0) {
    const newQty = cart.items[idx].quantity + quantity;
    if (newQty > product.stock) {
      throw new ApiError(
        400,
        `Only ${product.stock} left in stock`
      );
    }
    cart.items[idx].quantity = newQty;
  } else {
    if (quantity > product.stock) {
      throw new ApiError(
        400,
        `Only ${product.stock} left in stock`
      );
    }
    cart.items.push({ productId, quantity });
  }

  await cart.save();
  return buildCartResponse(cart);
};

export const updateCartItem = async (userId, productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new ApiError(404, "Product not found");

  const cart = await getOrCreateCart(userId);
  const idx = cart.items.findIndex(
    (i) => String(i.productId) === String(productId)
  );
  if (idx < 0) throw new ApiError(404, "Item not in cart");

  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} left in stock`);
  }

  cart.items[idx].quantity = quantity;
  await cart.save();
  return buildCartResponse(cart);
};

export const removeCartItem = async (userId, productId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = cart.items.filter(
    (i) => String(i.productId) !== String(productId)
  );
  await cart.save();
  return buildCartResponse(cart);
};

export const clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return buildCartResponse(cart);
};