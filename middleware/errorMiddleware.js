const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error("========== BACKEND ERROR ==========");
  console.error("Route:", req.method, req.originalUrl);
  console.error("Status:", statusCode);
  console.error("Message:", message);
  console.error("Stack:", err.stack);
  console.error("===================================");

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

export default errorHandler;