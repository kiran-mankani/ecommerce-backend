import { Router } from "express";
import {
  create,
  getMyOrders,
  getMyOrder,
} from "../controllers/orderController.js";
import { createOrderValidator } from "../validators/orderValidator.js";
import validate from "../middleware/validateMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// All order routes require authentication
router.use(protect);

router.post("/", createOrderValidator, validate, create);
router.get("/", getMyOrders);
router.get("/:id", getMyOrder);

export default router;