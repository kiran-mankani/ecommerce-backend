import express from "express";
import Stripe from "stripe";
import Product from "../models/Product.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/* ============================================================
   EXPRESS ROUTER — non-webhook endpoints
   (mounted at /api/v1/payment via server.js)
   ============================================================ */
const router = express.Router();

/* ---------- CREATE CHECKOUT SESSION ----------
   POST /api/v1/payment/create-checkout-session
   Body: { items: [{ productId, quantity }] }
------------------------------------------------ */
router.post("/create-checkout-session", async (req, res) => {
  console.log("╔═══════════════════════════════════════");
  console.log("║ 🔍 create-checkout-session HIT");
  console.log("║ 📦 req.body TYPE:", typeof req.body);
  console.log("║ 📦 req.body IS ARRAY:", Array.isArray(req.body));
  console.log("║ 📦 req.body KEYS:", Object.keys(req.body || {}));
  console.log("║ 📦 req.body FULL:", JSON.stringify(req.body, null, 2));

  try {
    // ✅ DEFENSIVE: handle all possible shapes
    let items;

    if (Array.isArray(req.body)) {
      // Body is already an array
      items = req.body;
      console.log("║ ✅ Extracted: body IS array");
    } else if (Array.isArray(req.body?.items)) {
      // Standard: { items: [...] }
      items = req.body.items;
      console.log("║ ✅ Extracted: body.items IS array");
    } else if (typeof req.body?.items === "string") {
      // Fallback: items was stringified
      try {
        items = JSON.parse(req.body.items);
        console.log("║ ✅ Extracted: parsed body.items string");
      } catch {
        items = [];
      }
    } else {
      items = [];
      console.log("║ ❌ Could not find items array anywhere");
    }

    console.log("║ 📦 items.length:", items.length);
    console.log("║ 🔍 Product model type:", typeof Product);
    console.log(
      "║ 🔑 Stripe key:",
      process.env.STRIPE_SECRET_KEY
        ? process.env.STRIPE_SECRET_KEY.slice(0, 15) + "..."
        : "MISSING!"
    );
    console.log("║ 🔍 CLIENT_URL:", process.env.CLIENT_URL);

    if (!items || items.length === 0) {
      console.log("║ ❌ Cart is empty");
      return res.status(400).json({ error: "Cart is empty" });
    }

    // ⚠️ SECURITY: Never trust client prices — fetch from DB
    const lineItems = await Promise.all(
      items.map(async (item) => {
        console.log("║ 🔍 Looking up product:", item.productId);

        let product;
        try {
          product = await Product.findById(item.productId);
        } catch (e) {
          console.log("║ ❌ findById threw:", e.message);
          throw new Error(
            `Invalid productId ${item.productId}: ${e.message}`
          );
        }

        if (!product) {
          console.log("║ ❌ Product NOT in DB:", item.productId);
          throw new Error(`Product not found: ${item.productId}`);
        }

        console.log(
          "║ ✅ Found:",
          product.name,
          "| price:",
          product.price
        );

        const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
        const unitAmount = Math.round(Number(product.price) * 100);
        console.log("║ 🔍 unitAmount (cents):", unitAmount);

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

    console.log("║ ✅ lineItems built:", lineItems.length);
    console.log("║ 🔍 Creating Stripe session...");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        userId: req.user?.id || "guest",
      },
    });

    console.log("║ ✅ Stripe session created:", session.id);
    console.log("╚═══════════════════════════════════════");

    res.json({ url: session.url, sessionId: session.id });
  } catch (err) {
    console.log("║ ❌❌❌ ERROR CAUGHT:");
    console.log("║ ❌ Message:", err.message);
    console.log("║ ❌ Type:", err.type);
    console.log("║ ❌ Code:", err.code);
    console.log("║ ❌ Stack:", err.stack);
    console.log("╚═══════════════════════════════════════");

    res.status(400).json({ error: err.message || "Payment session failed" });
  }
});

/* ---------- VERIFY SESSION ----------
   GET /api/v1/payment/verify-session/:sessionId
   Used by the success page to confirm payment.
------------------------------------------------ */
router.get("/verify-session/:sessionId", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(
      req.params.sessionId
    );

    res.json({
      paid: session.payment_status === "paid",
      amountTotal: session.amount_total, // in cents
      currency: session.currency,
      customerEmail: session.customer_details?.email || null,
      status: session.status,
    });
  } catch (err) {
    console.error("Stripe verify error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================
   WEBHOOK HANDLER — raw body required
   ============================================================ */
const webhookHandler = (req, res) => {
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

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      console.log("✅ Payment succeeded:", session.id);
      break;
    }
    case "checkout.session.expired":
    case "payment_intent.payment_failed": {
      const obj = event.data.object;
      console.log("❌ Payment failed/expired:", obj.id);
      break;
    }
    default:
      console.log(`Unhandled event: ${event.type}`);
  }

  res.json({ received: true });
};

/* ============================================================
   EXPORTS
   ============================================================ */
export { router, webhookHandler };
export default { router, webhookHandler };