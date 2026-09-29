import { Router } from "express";
import {
  getMe,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  uploadAvatar,
} from "../controllers/userController.js";
import {
  updateProfileValidator,
  changePasswordValidator,
} from "../validators/userValidator.js";
import validate from "../middleware/validateMiddleware.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadAvatarImage } from "../middleware/uploadMiddleware.js";

const router = Router();

// All user routes require authentication
router.use(protect);

router.get("/me", getMe);
router.get("/profile", getProfile);
router.put("/profile", updateProfileValidator, validate, updateProfile);
router.put("/change-password", changePasswordValidator, validate, changePassword);
router.post("/avatar", uploadAvatarImage, uploadAvatar);
router.post("/logout", logout);

export default router;