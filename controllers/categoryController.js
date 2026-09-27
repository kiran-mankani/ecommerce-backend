import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  listCategories,
  getCategoryById,
} from "../services/categoryService.js";

/* ============ PUBLIC ============ */

export const getCategories = asyncHandler(async (req, res) => {
  const data = await listCategories(req.query);
  res.status(200).json(new ApiResponse(200, data, "Categories fetched"));
});

export const getCategory = asyncHandler(async (req, res) => {
  const data = await getCategoryById(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Category fetched"));
});

/* ============ ADMIN ============ */

export const create = asyncHandler(async (req, res) => {
  const data = await createCategory(req.body);
  res.status(201).json(new ApiResponse(201, data, "Category created"));
});

export const update = asyncHandler(async (req, res) => {
  const data = await updateCategory(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, data, "Category updated"));
});

export const remove = asyncHandler(async (req, res) => {
  const data = await deleteCategory(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Category deleted"));
});