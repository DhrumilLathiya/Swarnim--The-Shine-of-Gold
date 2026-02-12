/**
 * Global error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err);

  // Multer errors
  if (err.name === "MulterError") {
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({
        error: "File too large",
        detail: "Maximum file size is 50MB",
      });
    }
    return res.status(400).json({
      error: "File upload error",
      detail: err.message,
    });
  }

  // Custom error messages
  if (err.message === "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.") {
    return res.status(400).json({
      error: "Validation error",
      detail: err.message,
    });
  }

  // Default error
  return res.status(err.status || 500).json({
    error: err.error || "Internal server error",
    detail: err.message || "An unexpected error occurred",
  });
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: "Not found",
    detail: `Route ${req.method} ${req.path} not found`,
  });
};

export default {
  errorHandler,
  notFoundHandler,
};