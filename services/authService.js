import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import generateToken from "../utils/generateToken.js";
import { generateOtp, hashOtp, getOtpExpiry } from "../utils/generateOtp.js";
import { USER_ROLES } from "../constants/index.js";

const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.";

/**
 * Signup — creates user, generates verification OTP
 */
export const signupUser = async ({ name, email, password }) => {
  if (!PASSWORD_REGEX.test(password)) {
    throw new ApiError(400, PASSWORD_MESSAGE);
  }

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

  // In dev: log OTP (in prod: send via email service)
  if (process.env.NODE_ENV === "development") {
    console.log(`📧 [DEV] OTP for ${email}: ${otp}`);
  }

  return {
    user: user.toSafeObject(),
    // Return devOtp only in development so frontend can be tested easily
    ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
  };
};

/**
 * Verify OTP
 */
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

/**
 * Login
 */
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  if (!user.isVerified) {
    throw new ApiError(403, "Please verify your email before logging in");
  }

  const token = generateToken(user._id, user.role);

  return { user: user.toSafeObject(), token };
};

/**
 * Resend / generate new OTP for signup verification
 */
export const resendOtpService = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");
  if (user.isVerified) throw new ApiError(400, "Email is already verified");

  const otp = generateOtp();
  user.otp = hashOtp(otp);
  user.otpExpiry = getOtpExpiry();
  await user.save();

  if (process.env.NODE_ENV === "development") {
    console.log(`📧 [DEV] New OTP for ${email}: ${otp}`);
  }

  return {
    message: "OTP resent successfully",
    ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
  };
};

/**
 * Forgot password — generate reset OTP
 */
export const forgotPasswordService = async ({ email }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "No account found with this email");

  const otp = generateOtp();
  user.resetOtp = hashOtp(otp);
  user.resetOtpExpiry = getOtpExpiry();
  await user.save();

  if (process.env.NODE_ENV === "development") {
    console.log(`🔐 [DEV] Reset OTP for ${email}: ${otp}`);
  }

  return {
    message: "Password reset OTP sent to your email",
    ...(process.env.NODE_ENV === "development" && { devOtp: otp }),
  };
};

/**
 * Reset password — verify OTP + set new password
 */
export const resetPasswordService = async ({ email, otp, newPassword }) => {
  if (!PASSWORD_REGEX.test(newPassword)) {
    throw new ApiError(400, PASSWORD_MESSAGE);
  }

  const user = await User.findOne({ email }).select("+resetOtp +resetOtpExpiry");
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

  user.password = newPassword; // pre-save hook hashes it
  user.resetOtp = undefined;
  user.resetOtpExpiry = undefined;
  await user.save();

  return { message: "Password reset successful. Please login." };
};

/**
 * Logout — stateless on backend (client removes token)
 */
export const logoutUser = () => {
  return { message: "Logged out successfully" };
};