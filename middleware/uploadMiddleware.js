import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

/* =====================================================================
   Storage engines (Cloudinary)
   Serverless hosts like Vercel have a read-only filesystem, so files
   can't be written to local disk. Uploaded files get a public URL in
   `file.path`.
   ===================================================================== */
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: () => `product-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
  },
});

const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    public_id: (req) => `avatar-${req.user?._id || "user"}-${Date.now()}`,
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
