import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  createOrder,
  listMyOrders,
  getMyOrderById,
} from "../services/orderService.js";

export const create = asyncHandler(async (req, res) => {
  const data = await createOrder(req.user._id, req.body);
  res.status(201).json(new ApiResponse(201, data, "Order placed"));
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const data = await listMyOrders(req.user._id, req.query);
  res.status(200).json(new ApiResponse(200, data, "Orders fetched"));
});

export const getMyOrder = asyncHandler(async (req, res) => {
  const data = await getMyOrderById(req.user._id, req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Order fetched"));
});