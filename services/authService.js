// backend/services/authService.js
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import { generateOtp, hashOtp, getOtpExpiry } from "../utils/generateOtp.js";
import {
  sendVerificationOtpEmail,
  sendResetPasswordOtpEmail,
} from "../utils/sendEmail.js";
import { USER_ROLES } from "../constants/index.js";
import { issueTokenPair } from "./authRefreshService.js";
import { revokeAllUserTokens } from "../utils/tokenUtils.js";

/* =====================================================================
   Signup — creates user, emails verification OTP
   ===================================================================== */
export const signupUser = async ({ name, email, password }) => {
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const otp = generateOtp();

  const user = await User.create({
    name,
    email,
    password,
    role: USER_ROLES.CUSTOMER,
    isVerified: false,
    otp: hashOtp(otp),
    otpExpiry: getOtpExpiry(),
  });

  // 📧 Send OTP via email (real delivery)
  try {
    await sendVerificationOtpEmail(email, otp);
  } catch (mailErr) {
    console.error("⚠️ OTP email failed:", mailErr.message);
    // DEV FALLBACK: log OTP to terminal so you can keep testing without a verified domain
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 [DEV FALLBACK] OTP for ${email}: ${otp}`);
    }
  }

  return { user: user.toSafeObject() };
};

/* =====================================================================
   Verify OTP
   ===================================================================== */
export const verifyOtpService = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select("+otp +otpExpiry");
  if (!user) throw new ApiError(404, "User not found");

  if (user.isVerified) {
    throw new ApiError(400, "Email is already verified");
  }

  if (!user.otp || !user.otpExpiry) {
    throw new ApiError(400, "No OTP found. Please signup again.");
  }

  if (user.otpExpiry < new Date()) {
    throw new ApiError(400, "OTP has expired. Please request a new one.");
  }

  if (user.otp !== hashOtp(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpiry = undefined;
  await user.save();

  return { user: user.toSafeObject() };
};

/* =====================================================================
   Login
   ===================================================================== */
export const loginUser = async ({ email, password }, req) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  // Existing access token — kept for backward compatibility
  const token = generateToken(user._id, user.role);

  // Phase 6: also issue refresh token + a fresh access token through the helper
  const { accessToken, refreshToken } = await issueTokenPair(user, req);

  return {
    user: user.toSafeObject(),
    token,          // keep old field
    accessToken,    // new
    refreshToken,   // new
  };
};

/* =====================================================================
   Resend signup verification OTP
   ===================================================================== */
export const resendOtpService = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email is already verified");

  const otp = generateOtp();
  user.otp = hashOtp(otp);
  user.otpExpiry = getOtpExpiry();
  await user.save();

  // 📧 Send OTP via email (real delivery)
  try {
    await sendVerificationOtpEmail(email, otp);
  } catch (mailErr) {
    console.error("⚠️ OTP email failed:", mailErr.message);
    if (process.env.NODE_ENV === "development") {
      console.log(`📧 [DEV FALLBACK] Resent OTP for ${email}: ${otp}`);
    }
  }

  return { message: "OTP resent successfully" };
};

/* =====================================================================
   Forgot password — generate reset OTP, email it
   ===================================================================== */
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email");

  const otp = generateOtp();
  user.resetOtp = hashOtp(otp);
  user.resetOtpExpiry = getOtpExpiry();
  await user.save();

  // 📧 Send reset OTP via email
  try {
    await sendResetPasswordOtpEmail(email, otp);
  } catch (mailErr) {
    console.error("⚠️ Reset email failed:", mailErr.message);
    if (process.env.NODE_ENV === "development") {
      console.log(`🔐 [DEV FALLBACK] Reset OTP for ${email}: ${otp}`);
    }
  }

  return { message: "Password reset OTP sent to your email" };
};

/* =====================================================================
   Reset password
   ===================================================================== */
export const resetPasswordService = async ({ email, otp, newPassword }) => {
  const user = await User.findOne({ email }).select(
    "+resetOtp +resetOtpExpiry"
  );
  if (!user) throw new ApiError(404, "User not found");

  if (!user.resetOtp || !user.resetOtpExpiry) {
    throw new ApiError(400, "No reset request found. Please request again.");
  }

  if (user.resetOtpExpiry < new Date()) {
    throw new ApiError(400, "Reset OTP has expired");
  }

  if (user.resetOtp !== hashOtp(otp)) {
    throw new ApiError(400, "Invalid OTP");
  }

  user.password = newPassword; // pre-save hook re-hashes
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  // Phase 6: revoke all refresh tokens on password change (security)
  try {
    await revokeAllUserTokens(user._id);
  } catch {
    /* non-fatal */
  }

  return { message: "Password reset successful. Please login." };
};

/* =====================================================================
   Logout
   ===================================================================== */
export const logoutUser = () => {
  return { message: "Logged out successfully" };
};