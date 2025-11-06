const crypto = require('crypto');
const fs = require('fs');

function readKeyFromEnv() {
  const keyPath = process.env.ENCRYPTION_KEY; 
  if (!keyPath) throw new Error("ENCRYPTION_KEY env var not set");
  const raw = fs.readFileSync(keyPath, 'utf8').trim();
  const key = Buffer.from(raw, 'base64');
  if (key.length !== 32) throw new Error("Encryption key must be 32 bytes (base64)");
  return key;
}

// Encrypt an object (returns base64 ciphertext + iv + tag)
function encryptJSON(obj) {
  const key = readKeyFromEnv();
  const iv = crypto.randomBytes(12); 
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = Buffer.from(JSON.stringify(obj), 'utf8');
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return {
    encrypted: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64')
  };
}

// Decrypt using base64 encrypted, iv, tag (returns original object)
function decryptToJSON(encryptedBase64, ivBase64, tagBase64) {
  const key = readKeyFromEnv();
  const iv = Buffer.from(ivBase64, 'base64');
  const tag = Buffer.from(tagBase64, 'base64');
  const ciphertext = Buffer.from(encryptedBase64, 'base64');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString('utf8'));
}

module.exports = { encryptJSON, decryptToJSON };
