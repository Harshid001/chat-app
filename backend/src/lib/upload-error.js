const { APIConnectionTimeoutError } = require("@imagekit/nodejs");
class UploadError extends Error {
  constructor(code, status, message, retryable = false) {
    super(message);
    this.name = "UploadError";
    Object.assign(this, { code, status, retryable });
  }
}
function providerUploadError(error) {
  if (error.status === 403)
    return new UploadError(
      "UPLOAD_ACCESS_DENIED",
      503,
      "The upload service denied access. You can still send text; contact support to restore attachments.",
    );
  if (error.status === 401)
    return new UploadError(
      "UPLOAD_CONFIGURATION",
      503,
      "Attachments are unavailable because the upload service is not configured correctly. You can send text now; contact support if this continues.",
    );
  if ([402, 429].includes(error.status))
    return new UploadError(
      "UPLOAD_CAPACITY",
      503,
      "The upload service has reached its limit. Try again later, or send a text message.",
      true,
    );
  if (error.status === 413)
    return new UploadError(
      "UPLOAD_TOO_LARGE",
      413,
      "The upload service rejected this file’s size. Compress it or choose a smaller file.",
    );
  if ([400, 422].includes(error.status))
    return new UploadError(
      "UPLOAD_REJECTED",
      422,
      "The upload service could not accept this file. Export it as JPG, PNG, or MP4 and choose the new file.",
    );
  if (error instanceof APIConnectionTimeoutError || error.status === 408)
    return new UploadError(
      "UPLOAD_TIMEOUT",
      504,
      "The upload service took too long to respond. Try again with a stable connection or a smaller file.",
      true,
    );
  return new UploadError(
    "UPLOAD_UNAVAILABLE",
    503,
    "The upload service could not be reached. Your attachment is still here; try again shortly.",
    true,
  );
}
module.exports = { UploadError, providerUploadError };
