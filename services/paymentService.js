import Stripe from "stripe";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { createOrder } from "./orderService.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Create a Stripe Checkout Session
 * Called from frontend when user clicks "Proceed to Checkout"
 */
export const createCheckoutSession = async (userId, { items, shippingAddress }) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, "No items provided");
  }

  // Fetch products to validate + get real prices
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } });
  const byId = new Map(products.map((p) => [String(p._id), p]));

  const line_items = [];
  for (const it of items) {
    const p = byId.get(String(it.productId));
    if (!p) throw new ApiError(400, "A product no longer exists");
    if (p.status !== "active") throw new ApiError(400, `${p.name} is not available`);
    if (p.stock < it.quantity) {
      throw new ApiError(400, `Only ${p.stock} left in stock for ${p.name}`);
    }

    const discountAmount = (p.price * (p.discount || 0)) / 100;
    const finalPrice = p.price - discountAmount;

    line_items.push({
      price_data: {
        currency: "usd",
        product_data: {
          name: p.name,
          images: p.images?.[0] ? [p.images[0]] : [],
        },
        unit_amount: Math.round(finalPrice * 100), // Stripe expects cents
      },
      quantity: it.quantity,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cart`,
    metadata: {
      userId: String(userId),
      shippingAddress: JSON.stringify(shippingAddress || {}),
    },
  });

  return { url: session.url, sessionId: session.id };
};

/**
 * Verify a Stripe Checkout Session
 * Called from frontend when user returns to /order-success
 * 🔑 This is where stock gets decremented + cart is cleared
 */
export const verifyCheckoutSession = async (sessionId) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    return { paid: false };
  }

  // 🔑 IDEMPOTENCY: if order already created for this session, return it
  const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
  if (existingOrder) {
    console.log("♻️ Order already exists for session:", sessionId);
    return {
      paid: true,
      order: existingOrder.toObject(),
      updatedProducts: [],
      alreadyProcessed: true,
    };
  }

  // Extract metadata
  const userId = session.metadata.userId;
  const shippingAddress = JSON.parse(session.metadata.shippingAddress || "{}");

  // 🔑 CREATE ORDER — this decrements stock + clears cart
  let result;
  try {
    result = await createOrder(userId, { shippingAddress });
  } catch (err) {
    console.error("❌ createOrder failed:", err.message);
    throw new ApiError(500, err.message || "Failed to create order");
  }

  const { order, updatedProducts } = result;

  // Attach Stripe session ID to the order (for idempotency next time)
  order.stripeSessionId = sessionId;
  order.paymentStatus = "paid";
  await Order.findByIdAndUpdate(order._id, {
    stripeSessionId: sessionId,
    paymentStatus: "paid",
  });

  console.log("✅ Order created:", order._id);
  console.log("📦 Stock changes:", updatedProducts);

  return {
    paid: true,
    order,
    updatedProducts,  // 🔑 Frontend uses this to refresh product badges
    alreadyProcessed: false,
  };
};