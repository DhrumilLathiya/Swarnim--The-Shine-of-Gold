/**
 * GLOBAL ERROR HANDLER
 * 
 * PURPOSE: Catches and processes all unhandled errors in the request-response cycle.
 * USAGE: Registered as the final middleware in src/index.js to provide consistent JSON error responses.
 */
// MAIN ERROR HANDLER: Categorizes errors and sends appropriate HTTP status codes and messages
export const errorHandler = (err, req, res, next) => {
  // Always log the full error to the server console for developer debugging
  console.error("Error:", err);

  // MULTER ERROR HANDLING: Specifically handle errors from the file upload middleware
  if (err.name === "MulterError") {
    // Check for specific file size limit violation
    if (err.code === "FILE_TOO_LARGE") {
      return res.status(413).json({
        error: "File too large",
        detail: "Maximum file size is 50MB",
      });
    }
    // Generic upload errors (e.g., too many files)
    return res.status(400).json({
      error: "File upload error",
      detail: err.message,
    });
  }

  // VALIDATION ERROR: Handle specific business logic error for allowed file extensions
  if (err.message === "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.") {
    return res.status(400).json({
      error: "Validation error",
      detail: err.message,
    });
  }

  // DEFAULT ERROR: Standard fallback for all other unexpected server errors
  return res.status(err.status || 500).json({
    success: false,
    error: err.error || "Internal server error",
    message: err.message || "An unexpected error occurred",
    detail: err.detail || err.message || "An unexpected error occurred"
  });
};

// 404 NOT FOUND HANDLER: Catches any requests to routes that are not defined in the application
export const notFoundHandler = (req, res) => {
  // Inform the client exactly which method and path was not found
  res.status(404).json({
    error: "Not found",
    detail: `Route ${req.method} ${req.path} not found`,
  });
};

export default {
  errorHandler,
  notFoundHandler,
};