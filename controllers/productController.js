import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
  getProductById,
} from "../services/productService.js";

/* Public */
export const getProducts = asyncHandler(async (req, res) => {
  const data = await listProducts(req.query);
  res.status(200).json(new ApiResponse(200, data, "Products fetched"));
});

export const getProduct = asyncHandler(async (req, res) => {
  const data = await getProductById(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Product fetched"));
});

/* Admin */
export const create = asyncHandler(async (req, res) => {
  const data = await createProduct(req.body);
  res.status(201).json(new ApiResponse(201, data, "Product created"));
});

export const update = asyncHandler(async (req, res) => {
  const data = await updateProduct(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, data, "Product updated"));
});

export const remove = asyncHandler(async (req, res) => {
  const data = await deleteProduct(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Product deleted"));
});
/**
 * POST /api/v1/products/upload
 * Admin only. Accepts multipart/form-data with up to 5 files under "images".
 * Returns an array of Cloudinary URLs.
 */
export const uploadImages = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "No images uploaded"));
  }

  const urls = req.files.map((f) => f.path); // CloudinaryStorage sets `path`
  res.status(200).json(new ApiResponse(200, { urls }, "Images uploaded"));
});