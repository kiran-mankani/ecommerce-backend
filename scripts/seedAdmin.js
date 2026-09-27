import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ MongoDB connected");

    const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase().trim();
    const adminName = process.env.ADMIN_NAME?.trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminName || !adminPassword) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD are required in .env"
      );
    }

    const existingUser = await User.findOne({ email: adminEmail });

    if (existingUser) {
      if (existingUser.role === "admin") {
        console.log("ℹ️ Admin already exists:", adminEmail);
      } else {
        console.log(
          "❌ Email already belongs to a non-admin user. Admin was NOT created."
        );
      }

      await mongoose.disconnect();
      return;
    }

    const admin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      isVerified: true,
    });

    console.log("✅ Admin created successfully");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);
    console.log("Verified:", admin.isVerified);

    await mongoose.disconnect();
  } catch (error) {
    console.error("❌ Admin seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedAdmin();