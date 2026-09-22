import crypto from "crypto";

/**
 * Generate a 6-digit numeric OTP
 */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP before storing (so DB doesn't hold plaintext OTP)
 */
const hashOtp = (otp) => {
  return crypto.createHash("sha256").update(otp).digest("hex");
};

/**
 * OTP validity: 10 minutes from now
 */
const getOtpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

export { generateOtp, hashOtp, getOtpExpiry };