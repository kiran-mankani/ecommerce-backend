import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * protect — verifies JWT and attaches req.user
 */
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, "Invalid or expired token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new ApiError(401, "User no longer exists");
  }

  req.user = user;
  next();
});

/**
 * authorize — RBAC check
 * Usage: authorize("admin") or authorize("admin", "customer")
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, "Not authenticated"));
    }
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Role '${req.user.role}' is not allowed to access this resource`)
      );
    }
    next();
  };
};