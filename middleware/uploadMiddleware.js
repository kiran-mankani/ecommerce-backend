import multer from "multer";
import path from "path";
import fs from "fs";
import ApiError from "../utils/ApiError.js";

/* =====================================================================
   Ensure upload directories exist
   ===================================================================== */
const productDir = "uploads/products";
const avatarDir = "uploads/avatars";

if (!fs.existsSync(productDir)) fs.mkdirSync(productDir, { recursive: true });
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

/* =====================================================================
   Storage engines (local disk)
   ===================================================================== */
const productStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, productDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(null, `product-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});

const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".png";
    cb(
      null,
      `avatar-${req.user?._id || "user"}-${Date.now()}${ext}`
    );
  },
});

/* =====================================================================
   Shared filter
   ===================================================================== */
const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, PNG, or WEBP images are allowed"), false);
  }
};

/* =====================================================================
   Product image uploads (up to 5 files, field name "images")
   ===================================================================== */
export const upload = multer({
  storage: productStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadProductImages = upload.array("images", 5);

/* =====================================================================
   Avatar uploads (single file, field name "avatar")
   ===================================================================== */
export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadAvatarImage = avatarUpload.single("avatar");