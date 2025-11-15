const multer = require("multer");

function uploadErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: 'File too large',
      LIMIT_UNEXPECTED_FILE: err.message ?? 'Invalid upload',
    };
    return res.status(400).json({ error: messages[err.code] ?? 'Upload error' });
  }
  next(err);
}

module.exports = { uploadErrorHandler };