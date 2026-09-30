const multer = require("multer");

const MAX_FILE_SIZE = 25 * 1024 * 1024; //25mb

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    const isImage = /^image\/(jpeg|png|gif|webp|avif)$/.test(file.mimetype);
    const isVideo = /^video\/(mp4|webm|quicktime)$/.test(file.mimetype);
    if (!isImage && !isVideo) {
      cb(new Error("only image and video uploads are allowrd"));
      return;
    }
    cb(null, true);
  },
});

module.exports = upload;
