import { body } from "express-validator";

const STRONG_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_+\-=[\]\\;'`~]).{8,}$/;

const STRONG_PASSWORD_MESSAGE =
  "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";

export const updateProfileValidator = [
  body("phone")
    .optional()
    .isString()
    .withMessage("Phone must be a string")
    .isLength({ max: 20 })
    .withMessage("Phone cannot exceed 20 characters"),
  body("address")
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),
  body("city")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("City cannot exceed 50 characters"),
  body("country")
    .optional()
    .isString()
    .isLength({ max: 50 })
    .withMessage("Country cannot exceed 50 characters"),
  body("profileImage")
    .optional()
    .isString()
    .withMessage("Profile image must be a URL string"),
  body("bio")
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("language")
    .optional()
    .isString()
    .isLength({ min: 2, max: 10 })
    .withMessage("Invalid language code"),
];

export const changePasswordValidator = [
  body("oldPassword").notEmpty().withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .matches(STRONG_PASSWORD_REGEX)
    .withMessage(STRONG_PASSWORD_MESSAGE),
];