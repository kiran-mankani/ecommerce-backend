import { Router } from "express";
import {
  getMyCart,
  add,
  updateItem,
  removeItem,
  clear,
} from "../controllers/cartController.js";
import {
  addToCartValidator,
  updateCartItemValidator,
} from "../validators/cartValidator.js";
import validate from "../middleware/validateMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";

const router = Router();

// Every cart route requires an authenticated user
router.use(protect);

router.get("/", getMyCart);
router.post("/", addToCartValidator, validate, add);
router.put("/items/:productId", updateCartItemValidator, validate, updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clear);

export default router;