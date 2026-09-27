import { body } from "express-validator";

export const createProductValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Product name is required")
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required")
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("price")
    .notEmpty()
    .withMessage("Price is required")
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .isMongoId()
    .withMessage("Invalid category id"),
  body("brand")
    .optional({ checkFalsy: true })
    .isLength({ max: 60 })
    .withMessage("Brand cannot exceed 60 characters"),
  body("stock")
    .notEmpty()
    .withMessage("Stock is required")
    .isInt({ min: 0 })
    .withMessage("Stock must be a whole number ≥ 0"),
  body("images")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Images must be an array of up to 5 URLs"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a URL string"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be 'active' or 'inactive'"),
];

export const updateProductValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage("Name must be between 2 and 120 characters"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Description cannot exceed 2000 characters"),
  body("price")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Price must be greater than 0"),
  body("discount")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Discount must be between 0 and 100"),
  body("categoryId")
    .optional()
    .isMongoId()
    .withMessage("Invalid category id"),
  body("brand")
    .optional({ checkFalsy: true })
    .isLength({ max: 60 })
    .withMessage("Brand cannot exceed 60 characters"),
  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Stock must be a whole number ≥ 0"),
  body("images")
    .optional()
    .isArray({ max: 5 })
    .withMessage("Images must be an array of up to 5 URLs"),
  body("images.*")
    .optional()
    .isString()
    .withMessage("Each image must be a URL string"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be 'active' or 'inactive'"),
];