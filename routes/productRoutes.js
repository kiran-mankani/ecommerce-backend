import { Router } from "express";
import {
  getProducts,
  getProduct,
  create,
  update,
  remove,
} from "../controllers/productController.js";
import {
  createProductValidator,
  updateProductValidator,
} from "../validators/productValidator.js";
import validate from "../middleware/validateMiddleware.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

/* Public */
router.get("/", getProducts);
router.get("/:id", getProduct);

/* Admin only */
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN),
  createProductValidator,
  validate,
  create
);

router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  updateProductValidator,
  validate,
  update
);

router.delete("/:id", protect, authorize(USER_ROLES.ADMIN), remove);

export default router;