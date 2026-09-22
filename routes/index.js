import { Router } from "express";
import authRoutes from "./authRoutes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

// Auth
router.use("/auth", authRoutes);

// Future:
// router.use("/users", userRoutes);
// router.use("/categories", categoryRoutes);
// ...

export default router;