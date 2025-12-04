const fs = require("fs");
const multer = require("multer");
const path = require("path");

const audit = require("../../services/audit");

const {
    generateRandomFilename,
    hasSafeImageExtension,
    verifyMagicBytes,
    cleanupFile
} = require("../../utils/upload");

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

  // 1. Configure Multer (Standard)
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

  // 2. Select Multer Mode
  let multerMiddleware;
  switch (mode?.type) {
    case 'single':
      multerMiddleware = upload.single(mode.field);
      break;
    case 'array':
      multerMiddleware = upload.array(mode.field, mode.maxCount);
      break;
    default:
      throw new Error('Invalid upload mode');
  }

  // 3. Create the Binary Validation Middleware
  const binaryValidator = async (req, res, next) => {
    // If no file was uploaded, skip validation (unless your route requires it)
    if (!req.file && (!req.files || req.files.length === 0)) {
      return next();
    }

    const filesToCheck = req.file ? [req.file] : (req.files || []);
    const invalidFiles = [];

    for (const file of filesToCheck) {
      const isValid = await verifyMagicBytes(file.path);
      if (!isValid) {
        invalidFiles.push(file);
      }
    }

    if (invalidFiles.length > 0) {
      audit.logFileUploadMagicBytes(req.user?.sub, req.ip);

      // Delete the bad files immediately
      await Promise.all(invalidFiles.map(f => cleanupFile(f.path)));
      
      // Delete the good files too (Atomic Transaction philosophy)
      // Usually if one file in a batch is malicious, we reject the whole batch.
      const validFiles = filesToCheck.filter(f => !invalidFiles.includes(f));
      await Promise.all(validFiles.map(f => cleanupFile(f.path)));

      return res.status(400).json({ 
        error: 'Security Check Failed: File content does not match image format (Magic Bytes).' 
      });
    }

    next();
  };

  return [multerMiddleware, binaryValidator];
}

module.exports = { createUploadMiddleware };
