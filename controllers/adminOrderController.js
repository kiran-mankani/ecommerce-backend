import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  listAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getOrderStats,
} from "../services/adminOrderService.js";

export const getOrders = asyncHandler(async (req, res) => {
  const data = await listAllOrders(req.query);
  res.status(200).json(new ApiResponse(200, data, "Orders fetched"));
});

export const getOrder = asyncHandler(async (req, res) => {
  const data = await getOrderById(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Order fetched"));
});

export const putOrderStatus = asyncHandler(async (req, res) => {
  const data = await updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json(new ApiResponse(200, data, "Order status updated"));
});

export const removeOrder = asyncHandler(async (req, res) => {
  const data = await deleteOrder(req.params.id);
  res.status(200).json(new ApiResponse(200, data, "Order deleted"));
});

export const getOrderStatistics = asyncHandler(async (req, res) => {
  const data = await getOrderStats();
  res.status(200).json(new ApiResponse(200, data, "Order statistics fetched"));
});