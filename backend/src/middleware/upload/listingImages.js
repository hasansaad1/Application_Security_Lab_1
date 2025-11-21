const path = require("path");
const { createUploadMiddleware } = require("./baseUpload");
const { uploads } = require("../../config");

const LISTING_IMAGES_DIR = path.join(uploads.root, 'listing_images');

const uploadListingImages = createUploadMiddleware({
  uploadDir: LISTING_IMAGES_DIR,
  limits: { fileSizeMB: 5, maxFiles: 10 }, // Max 10 images, 5MB each
  mode: { type: 'array', field: 'images', maxCount: 10 },
});

module.exports = { uploadListingImages };

