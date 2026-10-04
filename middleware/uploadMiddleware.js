import multer from "multer";
import ApiError from "../utils/ApiError.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

/* =====================================================================
   Files are kept in memory (never written to disk) and streamed
   straight to Cloudinary. After upload, each file gets:
     - file.path         -> Cloudinary secure URL (stored in the DB)
     - file.cloudinaryId -> Cloudinary public_id
   ===================================================================== */
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new ApiError(400, "Only JPG, PNG, or WEBP images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* Runs a multer handler, converting multer errors into ApiErrors */
const runMulter = (handler, req, res) =>
  new Promise((resolve, reject) => {
    handler(req, res, (err) => {
      if (!err) return resolve();
      if (err instanceof multer.MulterError) {
        const message =
          err.code === "LIMIT_FILE_SIZE"
            ? "Each image must be 5 MB or smaller"
            : err.code === "LIMIT_UNEXPECTED_FILE"
            ? "Too many images or wrong field name"
            : err.message;
        return reject(new ApiError(400, message));
      }
      reject(err);
    });
  });

const sendToCloudinary = async (file, folder, publicId) => {
  try {
    const result = await uploadBufferToCloudinary(file.buffer, {
      folder,
      public_id: publicId,
    });
    file.path = result.secure_url;
    file.cloudinaryId = result.public_id;
    delete file.buffer; // free memory
  } catch (err) {
    throw new ApiError(502, `Image upload to Cloudinary failed: ${err.message}`);
  }
};

/* =====================================================================
   Product image uploads (up to 5 files, field name "images")
   ===================================================================== */
export const uploadProductImages = async (req, res, next) => {
  try {
    await runMulter(upload.array("images", 5), req, res);

    await Promise.all(
      (req.files || []).map((file) =>
        sendToCloudinary(
          file,
          "ecommerce/products",
          `product-${Date.now()}-${Math.round(Math.random() * 1e6)}`
        )
      )
    );
    next();
  } catch (err) {
    next(err);
  }
};

/* =====================================================================
   Avatar uploads (single file, field name "avatar")
   ===================================================================== */
export const uploadAvatarImage = async (req, res, next) => {
  try {
    await runMulter(upload.single("avatar"), req, res);

    if (req.file) {
      await sendToCloudinary(
        req.file,
        "ecommerce/avatars",
        `avatar-${req.user?._id || "user"}-${Date.now()}`
      );
    }
    next();
  } catch (err) {
    next(err);
  }
};
