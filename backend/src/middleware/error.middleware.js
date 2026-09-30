const { UploadError } = require("../lib/upload-error");
module.exports = (error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.name === "MulterError") {
    error =
      error.code === "LIMIT_FILE_SIZE"
        ? new UploadError(
            "UPLOAD_TOO_LARGE",
            413,
            "This file exceeds the 25 MB limit. Compress it or choose a smaller file.",
          )
        : new UploadError(
            "UPLOAD_INVALID_REQUEST",
            400,
            "Choose one photo or video at a time, then try again.",
          );
  }
  if (error instanceof UploadError)
    return res
      .status(error.status)
      .json({
        code: error.code,
        message: error.message,
        retryable: error.retryable,
      });
  // Log diagnostic categories only; SDK errors may contain credentials or file data.
  console.error("Request failed:", { type: error.name, status: error.status });
  res.status(error.status === 413 ? 413 : 500).json({
    message:
      error.status === 413
        ? "This request is too large. Choose a smaller file or shorten your message."
        : "The server could not save your message. Try again shortly.",
    retryable: true,
  });
};
