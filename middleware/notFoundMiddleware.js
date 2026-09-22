import ApiError from "../utils/ApiError.js";

const notFound = (req, res, next) => {
  console.warn("⚠️  404:", req.method, req.originalUrl);
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};

export default notFound;