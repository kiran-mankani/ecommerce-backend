import { body } from "express-validator";

export const addToCartValidator = [
  body("productId")
    .notEmpty()
    .withMessage("productId is required")
    .isMongoId()
    .withMessage("Invalid productId"),
  body("quantity")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Quantity must be a whole number ≥ 1"),
];

export const updateCartItemValidator = [
  body("quantity")
    .notEmpty()
    .withMessage("quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a whole number ≥ 1"),
];