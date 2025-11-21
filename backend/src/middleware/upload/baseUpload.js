const fs = require("fs");
const multer = require("multer");
const path = require("path");

const {
    generateRandomFilename,
    hasSafeImageExtension
} = require("../../utils/upload");

// TODO: Should we encrypt files on disk?

/**
 * Generic upload factory
 * Options:
 *   - uploadDir: absolute path to folder
 *   - limits: { fileSizeMB }
 *   - mode:
 *       { type: 'single', field: 'avatar' }
 *       { type: 'array', field: 'photos', maxCount: 5 }
 */
function createUploadMiddleware({ uploadDir, limits, mode }) {
  if (!path.isAbsolute(uploadDir)) {
    throw new Error('uploadDir must be absolute');
  }

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => cb(null, generateRandomFilename(file.originalname)),
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: (limits?.fileSizeMB ?? 5) * 1024 * 1024,
      files: limits?.maxFiles,
    },
    fileFilter: (_, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Only image uploads allowed'));
      }
      if (!hasSafeImageExtension(file.originalname)) {
        return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid image extension'));
      }
      cb(null, true);
    },
  });

  switch (mode?.type) {
    case 'single':
      return upload.single(mode.field);
    case 'array':
      return upload.array(mode.field, mode.maxCount);
    default:
      throw new Error('Invalid upload mode');
  }
}

module.exports = { createUploadMiddleware };
