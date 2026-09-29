import { Router } from "express";
import {
  getDashboard,
  getUsers,
  getUser,
  getMe,
} from "../controllers/adminController.js";
import {
  getOrders,
  getOrder,
  putOrderStatus,
  removeOrder,
  getOrderStatistics,
} from "../controllers/adminOrderController.js";
import { updateStatusValidator } from "../validators/adminOrderValidator.js";
import validate from "../middleware/validateMiddleware.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

router.use(protect, authorize(USER_ROLES.ADMIN));

router.get("/me", getMe);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUser);

// Orders
router.get("/orders", getOrders);
router.get("/orders/statistics", getOrderStatistics);
router.get("/orders/:id", getOrder);
router.put("/orders/:id/status", updateStatusValidator, validate, putOrderStatus);
router.delete("/orders/:id", removeOrder);

export default router;