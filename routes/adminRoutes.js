import { Router } from "express";
import {
  getDashboard,
  getUsers,
  getUser,
  getMe,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { USER_ROLES } from "../constants/index.js";

const router = Router();

// Every route in this file is admin-only
router.use(protect, authorize(USER_ROLES.ADMIN));

router.get("/me", getMe);
router.get("/dashboard", getDashboard);
router.get("/users", getUsers);
router.get("/users/:id", getUser);

export default router;