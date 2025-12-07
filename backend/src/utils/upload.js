const crypto = require("crypto");
const path = require("path");
const fsPromises = require('fs').promises;

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

const MAGIC_BYTES = new Map([
  ['ffd8ff', 'image/jpeg'],
  ['89504e47', 'image/png'],
]);

async function verifyMagicBytes(filePath) {
  let fileHandle;
  try {
    fileHandle = await fsPromises.open(filePath, 'r');
    // Read first 8 bytes
    const buffer = Buffer.alloc(8);
    await fileHandle.read(buffer, 0, 8, 0);
    
    // Convert to hex
    const header = buffer.toString('hex').toLowerCase();

    // Check against map
    for (const [signature, _] of MAGIC_BYTES) {
      if (header.startsWith(signature)) return true;
    }
    return false;
  } catch (err) {
    console.error('Magic Byte Read Error:', err);
    return false; // Fail safe
  } finally {
    if (fileHandle) {
      await fileHandle.close()
    };
  }
}

/**
 * Helper: Deletes a file (used when validation fails)
 */
async function cleanupFile(filePath) {
  try {
    await fsPromises.unlink(filePath);
  } catch (err) {
    console.error(`Failed to delete invalid file at ${filePath}`, err);
  }
}

module.exports = {
    generateRandomFilename,
    hasSafeImageExtension,
    verifyMagicBytes,
    cleanupFile
};