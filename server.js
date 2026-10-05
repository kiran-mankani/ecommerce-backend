import "./config/env.js";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import notFound from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";

connectDB();

/* ✅ CREATE THE EXPRESS APP FIRST */
const app = express();

/* ============================ Security ============================ */
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

/* ============================ CORS ============================ */
const envOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Always allow localhost for dev
const devOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
];

const allowedOrigins = [...new Set([...envOrigins, ...devOrigins])];

console.log("✅ Allowed origins:", allowedOrigins);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      console.warn("❌ CORS blocked:", origin);
      return cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

/* ============================ Stripe Webhook ============================
   ⚠️ MUST be registered BEFORE express.json()
   ======================================================================= */
app.post(
  "/api/v1/payment/webhook",
  express.raw({ type: "application/json" }),
  paymentRoutes.webhookHandler
);

/* ============================ Body parsers ============================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ============================ Logging ============================ */
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

/* ============================ Routes ============================ */
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "E-commerce API is running",
    api: "/api/v1",
  });
});

// 🔍 Debug endpoint (remove after fixing CORS)
app.get("/debug/cors", (req, res) => {
  res.json({
    CLIENT_URL: process.env.CLIENT_URL,
    allowedOrigins,
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL || "not set",
  });
});

app.use("/api/v1", routes);
app.use("/api/v1/payment", paymentRoutes.router);

/* ============================ Errors ============================ */
app.use(notFound);
app.use(errorHandler);

/* ============================ Listen ============================ */
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(
      `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
    );
  });
}

export default app;