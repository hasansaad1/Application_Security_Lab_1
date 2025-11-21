const crypto = require("crypto");
const path = require("path");

const SAFE_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);

function generateRandomFilename(originalName) {
  const id = crypto.randomUUID();
  const ext = (path.extname(originalName) || '.jpg').toLowerCase();
  return `${id}${ext}`;
}

function hasSafeImageExtension(filename) {
  const ext = (path.extname(filename) || '').toLowerCase();
  return SAFE_IMAGE_EXTENSIONS.has(ext);
}

module.exports = {
    generateRandomFilename,
    hasSafeImageExtension
};