// ⬇️ MUST be the first import — loads .env before anything else
import "./config/env.js";

import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";

import connectDB from "./config/db.js";
import routes from "./routes/index.js";
import notFound from "./middleware/notFoundMiddleware.js";
import errorHandler from "./middleware/errorMiddleware.js";

// Connect Database
connectDB();

const app = express();

// Core Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// API Routes
app.use("/api/v1", routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Listen on 0.0.0.0 to avoid Windows localhost/IPv6 issues
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📧 Email user: ${process.env.EMAIL_USER}`);
  console.log(`🔑 Email pass length: ${process.env.EMAIL_PASS?.length}`);
});