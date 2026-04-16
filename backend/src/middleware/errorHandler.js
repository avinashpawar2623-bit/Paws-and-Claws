const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: "NOT_FOUND",
    message: `Route not found: ${req.originalUrl}`,
  });
};

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    error: err.code || "INTERNAL_ERROR",
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
};

module.exports = { notFoundHandler, errorHandler };
