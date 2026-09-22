import { body } from "express-validator";

export const signupValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];

export const loginValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
];

export const verifyOtpValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits"),
];

export const forgotPasswordValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
];

export const resetPasswordValidator = [
  body("email").trim().isEmail().withMessage("Valid email is required"),
  body("otp").trim().isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
];