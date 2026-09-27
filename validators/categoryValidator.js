import { body } from "express-validator";

export const createCategoryValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 300 })
    .withMessage("Description cannot exceed 300 characters"),
  body("image")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Image must be a URL string"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be 'active' or 'inactive'"),
];

export const updateCategoryValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage("Name must be between 2 and 60 characters"),
  body("description")
    .optional({ checkFalsy: true })
    .isLength({ max: 300 })
    .withMessage("Description cannot exceed 300 characters"),
  body("image")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Image must be a URL string"),
  body("status")
    .optional()
    .isIn(["active", "inactive"])
    .withMessage("Status must be 'active' or 'inactive'"),
];