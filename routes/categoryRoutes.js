import { Router } from "express";
import {
  getCategories,
  getCategory,
  create,
  update,
  remove,
} from "../controllers/categoryController.js";
import {
  createCategoryValidator,
  updateCategoryValidator,
} from "../validators/categoryValidator.js";
import validate from "../middleware/validateMiddleware.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

/* -------- PUBLIC (browse / filter) -------- */
router.get("/", getCategories);
router.get("/:id", getCategory);

/* -------- ADMIN ONLY -------- */
router.post(
  "/",
  protect,
  authorize(USER_ROLES.ADMIN),
  createCategoryValidator,
  validate,
  create
);
router.put(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  updateCategoryValidator,
  validate,
  update
);
router.delete(
  "/:id",
  protect,
  authorize(USER_ROLES.ADMIN),
  remove
);

export default router;