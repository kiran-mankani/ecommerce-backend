import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartService.js";

export const getMyCart = asyncHandler(async (req, res) => {
  const data = await getCart(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Cart fetched"));
});

export const add = asyncHandler(async (req, res) => {
  const data = await addToCart(req.user._id, req.body);
  res.status(200).json(new ApiResponse(200, data, "Added to cart"));
});

export const updateItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const data = await updateCartItem(req.user._id, productId, quantity);
  res.status(200).json(new ApiResponse(200, data, "Cart updated"));
});

export const removeItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = await removeCartItem(req.user._id, productId);
  res.status(200).json(new ApiResponse(200, data, "Item removed"));
});

export const clear = asyncHandler(async (req, res) => {
  const data = await clearCart(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Cart cleared"));
});