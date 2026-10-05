import express from "express";
import Stripe from "stripe";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import { createOrder } from "../services/orderService.js";
import { protect } from "../middleware/authMiddleware.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

/* ---------- HELPER: Validate ObjectId format ---------- */
const isValidObjectId = (id) =>
  typeof id === "string" && mongoose.Types.ObjectId.isValid(id);

/* ============================================================
   CREATE CHECKOUT SESSION
   POST /api/v1/payment/create-checkout-session
   ============================================================ */
router.post("/create-checkout-session", protect, async (req, res) => {
  console.log("╔═══════════════════════════════════════");
  console.log("║ 🔍 create-checkout-session HIT");
  console.log("║ 👤 req.user:", req.user?._id, req.user?.email);

  try {
    // ---- 1. Extract items (defensive) ----
    let items;
    if (Array.isArray(req.body)) {
      items = req.body;
    } else if (Array.isArray(req.body?.items)) {
      items = req.body.items;
    } else if (typeof req.body?.items === "string") {
      try {
        items = JSON.parse(req.body.items);
      } catch {
        items = [];
      }
    } else {
      items = [];
    }

    const shippingAddress = req.body?.shippingAddress || {};

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // ---- 2. Validate authenticated user ----
    const userId = req.user?._id?.toString();
    if (!isValidObjectId(userId)) {
      console.log("║ ❌ Invalid userId:", userId);
      return res.status(401).json({ error: "Not authenticated" });
    }

    console.log("║ 📦 userId:", userId);
    console.log("║ 📦 items:", items.length);
    console.log("║ 📦 shippingAddress:", JSON.stringify(shippingAddress));

    // ---- 3. Build Stripe line items ----
    const lineItems = await Promise.all(
      items.map(async (item) => {
        if (!isValidObjectId(item.productId)) {
          throw new Error(`Invalid productId: ${item.productId}`);
        }

        const product = await Product.findById(item.productId);
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        if (product.stock < item.quantity) {
          throw new Error(
            `Only ${product.stock} left in stock for ${product.name}`
          );
        }

        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        const discountAmount = (product.price * (product.discount || 0)) / 100;
        const finalPrice = product.price - discountAmount;
        const unitAmount = Math.round(finalPrice * 100);

        return {
          price_data: {
            currency: "usd",
            product_data: {
              name: product.name,
              images: product.images?.slice(0, 1) || [],
            },
            unit_amount: unitAmount,
          },
          quantity,
        };
      })
    );

    // ---- 4. Create Stripe session ----
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId,
        shippingAddress: JSON.stringify(shippingAddress),
      },
    });

    console.log("║ ✅ Stripe session:", session.id);
    console.log("╚═══════════════════════════════════════");

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.error("║ ❌ create-checkout-session error:", err.message);
    console.log("╚═══════════════════════════════════════");
    res.status(400).json({ error: err.message || "Payment session failed" });
  }
});

/* ============================================================
   VERIFY SESSION — Creates order + decrements stock + clears cart
   GET /api/v1/payment/verify-session/:sessionId
   ============================================================ */
router.get("/verify-session/:sessionId", protect, async (req, res) => {
  const sessionId = req.params.sessionId;
  console.log("╔═══════════════════════════════════════");
  console.log("║ 🔍 verify-session HIT:", sessionId);

  try {
    // ---- 1. Verify payment with Stripe ----
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      console.log("║ ⚠️ Payment not completed");
      console.log("╚═══════════════════════════════════════");
      return res.json({ paid: false });
    }

    // ---- 2. Idempotency: check if order already exists ----
    const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
    if (existingOrder) {
      console.log("║ ♻️ Order already exists:", existingOrder._id);
      console.log("╚═══════════════════════════════════════");
      return res.json({
        paid: true,
        order: existingOrder.toObject(),
        updatedProducts: [],
        alreadyProcessed: true,
      });
    }

    // ---- 3. Extract + validate metadata ----
    const userId = session.metadata?.userId;
    const shippingAddress = JSON.parse(
      session.metadata?.shippingAddress || "{}"
    );

    console.log("║ 📦 userId from metadata:", userId);
    console.log("║ 📦 shippingAddress:", JSON.stringify(shippingAddress));

    if (!isValidObjectId(userId)) {
      console.log("║ ❌ Invalid userId:", userId);
      console.log("╚═══════════════════════════════════════");
      return res.status(400).json({
        paid: true,
        error: `Invalid userId in session metadata: ${userId}`,
      });
    }

    // ---- 4. 🔑 CREATE THE ORDER ----
    console.log("║ 🔑 Creating order...");
    const result = await createOrder(userId, { shippingAddress });
    const { order, updatedProducts } = result;

    // ---- 5. Attach Stripe session ID ----
    await Order.findByIdAndUpdate(order._id, {
      stripeSessionId: sessionId,
      paymentStatus: "paid",
    });

    console.log("║ ✅ Order created:", order._id);
    console.log("║ 📦 Stock changes:", JSON.stringify(updatedProducts));
    console.log("╚═══════════════════════════════════════");

    res.json({
      paid: true,
      order,
      updatedProducts,
      alreadyProcessed: false,
    });
  } catch (err) {
    console.error("║ ❌ verify-session error:", err.message);
    console.error("║ ❌ stack:", err.stack);
    console.log("╚═══════════════════════════════════════");
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   WEBHOOK HANDLER — Backup path (fires when Stripe posts)
   ============================================================ */
const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const sessionId = session.id;

    try {
      const existing = await Order.findOne({ stripeSessionId: sessionId });
      if (existing) {
        console.log("♻️ [Webhook] Order already exists:", existing._id);
        return res.json({ received: true });
      }

      const userId = session.metadata?.userId;
      const shippingAddress = JSON.parse(
        session.metadata?.shippingAddress || "{}"
      );

      if (isValidObjectId(userId)) {
        const { order, updatedProducts } = await createOrder(userId, {
          shippingAddress,
        });
        await Order.findByIdAndUpdate(order._id, {
          stripeSessionId: sessionId,
          paymentStatus: "paid",
        });
        console.log("✅ [Webhook] Order created:", order._id);
        console.log("📦 [Webhook] Stock changes:", updatedProducts);
      }
    } catch (err) {
      console.error("❌ [Webhook] Failed:", err.message);
    }
  }

  res.json({ received: true });
};

/* ============================================================ */
export { router, webhookHandler };
export default { router, webhookHandler };