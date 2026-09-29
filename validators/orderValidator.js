import { body } from "express-validator";

export const createOrderValidator = [
  body("shippingAddress.name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("shippingAddress.phone")
    .trim()
    .notEmpty()
    .withMessage("Phone is required")
    .isLength({ max: 20 })
    .withMessage("Phone cannot exceed 20 characters"),
  body("shippingAddress.address")
    .trim()
    .notEmpty()
    .withMessage("Address is required")
    .isLength({ max: 200 })
    .withMessage("Address cannot exceed 200 characters"),
  body("shippingAddress.city")
    .trim()
    .notEmpty()
    .withMessage("City is required")
    .isLength({ max: 50 })
    .withMessage("City cannot exceed 50 characters"),
  body("shippingAddress.country")
    .trim()
    .notEmpty()
    .withMessage("Country is required")
    .isLength({ max: 50 })
    .withMessage("Country cannot exceed 50 characters"),
];