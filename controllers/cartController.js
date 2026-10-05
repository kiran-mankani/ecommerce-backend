import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "../services/cartService.js";

/* ------------------------------------------------------------
   GET /api/v1/cart
   ------------------------------------------------------------ */
export const getMyCart = asyncHandler(async (req, res) => {
  console.log("📥 getMyCart — userId:", req.user?._id);

  const data = await getCart(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Cart fetched"));
});

/* ------------------------------------------------------------
   POST /api/v1/cart
   Body: { productId, quantity }
   ------------------------------------------------------------ */
export const add = asyncHandler(async (req, res) => {
  console.log("📥 addToCart — body:", req.body);
  console.log("📥 addToCart — userId:", req.user?._id);

  const { productId, quantity } = req.body;

  if (!productId) {
    throw new ApiError(400, "productId is required");
  }

  const data = await addToCart(req.user._id, {
    productId,
    quantity: quantity || 1,
  });

  res.status(200).json(new ApiResponse(200, data, "Added to cart"));
});

/* ------------------------------------------------------------
   PUT /api/v1/cart/items/:productId
   Body: { quantity }
   ------------------------------------------------------------ */
export const updateItem = asyncHandler(async (req, res) => {
  console.log("📥 updateItem — params:", req.params, "body:", req.body);

  const { productId } = req.params;
  const { quantity } = req.body;

  if (!quantity) {
    throw new ApiError(400, "quantity is required");
  }

  const data = await updateCartItem(req.user._id, productId, quantity);
  res.status(200).json(new ApiResponse(200, data, "Cart updated"));
});

/* ------------------------------------------------------------
   DELETE /api/v1/cart/items/:productId
   ------------------------------------------------------------ */
export const removeItem = asyncHandler(async (req, res) => {
  console.log("📥 removeItem — params:", req.params);

  const { productId } = req.params;
  const data = await removeCartItem(req.user._id, productId);
  res.status(200).json(new ApiResponse(200, data, "Item removed"));
});

/* ------------------------------------------------------------
   DELETE /api/v1/cart
   ------------------------------------------------------------ */
export const clear = asyncHandler(async (req, res) => {
  console.log("📥 clearCart — userId:", req.user?._id);

  const data = await clearCart(req.user._id);
  res.status(200).json(new ApiResponse(200, data, "Cart cleared"));
});