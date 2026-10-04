/**
 * One-time migration: moves images that were saved in the local
 * /uploads folder to Cloudinary and replaces the DB paths with the
 * Cloudinary URLs (product images + user profile images).
 *
 * Usage: npm run migrate:images
 */
import "../config/env.js";
import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { uploadBufferToCloudinary } from "../utils/cloudinaryUpload.js";

const ROOT = process.cwd();

// Matches "/uploads/...", "uploads/..." or "http://host/uploads/..."
const getLocalUploadPath = (value) => {
  if (typeof value !== "string") return null;
  const match = value.match(/(?:^|\/)(uploads\/.+)$/);
  if (!match || /res\.cloudinary\.com/.test(value)) return null;
  return match[1];
};

const migrateOne = async (value, folder) => {
  const relative = getLocalUploadPath(value);
  if (!relative) return value; // already a remote URL

  const filePath = path.join(ROOT, relative);
  try {
    const buffer = await fs.readFile(filePath);
    const publicId = path.parse(filePath).name;
    const result = await uploadBufferToCloudinary(buffer, {
      folder,
      public_id: publicId,
      overwrite: true,
    });
    console.log(`   ⬆️  ${relative} -> ${result.secure_url}`);
    return result.secure_url;
  } catch (err) {
    console.warn(`   ⚠️  Could not migrate ${relative}: ${err.message}`);
    return null; // drop broken local reference
  }
};

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    /* -------- Products -------- */
    const products = await Product.find({
      images: { $elemMatch: { $regex: "uploads/" } },
    });
    console.log(`📦 Products to migrate: ${products.length}`);

    for (const product of products) {
      console.log(` • ${product.name}`);
      const urls = [];
      for (const img of product.images) {
        const url = await migrateOne(img, "ecommerce/products");
        if (url) urls.push(url);
      }
      product.images = urls;
      await product.save({ validateBeforeSave: false });
    }

    /* -------- User avatars -------- */
    const users = await User.find({
      "profile.profileImage": { $regex: "uploads/" },
    });
    console.log(`👤 Users to migrate: ${users.length}`);

    for (const user of users) {
      console.log(` • ${user.email}`);
      const url = await migrateOne(
        user.profile.profileImage,
        "ecommerce/avatars"
      );
      user.profile.profileImage = url || "";
      await user.save({ validateBeforeSave: false });
    }

    console.log("🎉 Migration complete");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      /* ignore */
    }
    process.exit(1);
  }
};

run();
