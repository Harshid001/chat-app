const multer = require("multer");
const { UploadError } = require("../lib/upload-error");

const MAX_FILE_SIZE = 25 * 1024 * 1024; //25mb

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
    fields: 2,
    fieldSize: 24 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const isImage = /^image\/(jpeg|png|gif|webp|avif)$/.test(file.mimetype);
    const isVideo = /^video\/(mp4|webm|quicktime)$/.test(file.mimetype);
    if (!isImage && !isVideo) {
      cb(
        new UploadError(
          "UPLOAD_UNSUPPORTED_TYPE",
          415,
          "This file format is not supported. Choose JPG, PNG, GIF, WebP, AVIF, MP4, WebM, or MOV.",
        ),
      );
      return;
    }
    cb(null, true);
  },
});

module.exports = upload;
