// backend/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { USER_ROLES } from "../constants/index.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.CUSTOMER,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
    resetOtp: {
      type: String,
      select: false,
    },
    resetOtpExpiry: {
      type: Date,
      select: false,
    },
    profile: {
      phone: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      country: { type: String, default: "" },
      profileImage: { type: String, default: "" },
      bio: {
        type: String,
        default: "",
        maxlength: [500, "Bio cannot exceed 500 characters"],
      },
      language: { type: String, default: "en" },
    },
  },
  { timestamps: true }
);

/* =====================================================================
   ✅ Password hashing — PROMISE STYLE (no `next` argument, no next())
   Mongoose runs this BEFORE every .save()
   ===================================================================== */
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // don't re-hash on non-password updates
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/* =====================================================================
   Compare a plain password against the stored hash
   ===================================================================== */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/* =====================================================================
   Strip sensitive fields before returning the user object
   ===================================================================== */
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.otp;
  delete obj.otpExpiry;
  delete obj.resetOtp;
  delete obj.resetOtpExpiry;
  delete obj.__v;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;