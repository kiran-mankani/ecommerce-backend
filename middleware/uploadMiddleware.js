import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";
import ApiError from "../utils/ApiError.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "ecommerce/products",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 1200, crop: "limit" }],
  },
});

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, PNG, or WEBP images are allowed"), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/* Accept up to 5 images in a field named "images" */
export const uploadProductImages = upload.array("images", 5);