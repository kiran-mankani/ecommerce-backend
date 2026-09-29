import "../config/env.js";
import mongoose from "mongoose";
import User from "../models/User.js";
import { USER_ROLES } from "../constants/index.js";

const ADMIN_NAME = process.env.ADMIN_NAME?.trim() || "Admin";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.toLowerCase().trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const run = async () => {
  try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
      throw new Error(
        "ADMIN_EMAIL and ADMIN_PASSWORD must be set in backend/.env"
      );
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Use select("+password") so we can update it
    let admin = await User.findOne({ email: ADMIN_EMAIL }).select("+password");

    if (admin) {
      // Existing user found — make sure it's an admin and reset the password
      admin.name = ADMIN_NAME;
      admin.password = ADMIN_PASSWORD; // pre-save hook re-hashes
      admin.role = USER_ROLES.ADMIN;
      admin.isVerified = true;
      await admin.save();

      console.log(`🔄 Admin updated: ${admin.email}`);
      console.log(`   Role:     ${admin.role}`);
      console.log(`   Verified: ${admin.isVerified}`);
    } else {
      // No user with that email — create one
      admin = await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: USER_ROLES.ADMIN,
        isVerified: true,
      });

      console.log(`🎉 Admin created: ${admin.email}`);
      console.log(`   Role:     ${admin.role}`);
      console.log(`   Verified: ${admin.isVerified}`);
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    try {
      await mongoose.disconnect();
    } catch (_) {
      /* ignore */
    }
    process.exit(1);
  }
};

run();