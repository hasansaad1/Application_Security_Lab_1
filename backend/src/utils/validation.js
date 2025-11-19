/**
 * Input validation and sanitization utilities
 */

// Sanitize string input - remove HTML tags and trim
function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  // Remove HTML tags
  return input.replace(/<[^>]*>/g, '').trim();
}

// Sanitize text input - allows basic formatting but removes scripts
function sanitizeText(input) {
  if (typeof input !== 'string') return input;
  // Remove script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

// Validate email format
function validateEmail(email) {
  if (typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim()) && email.length <= 255;
}

// Validate username
function validateUsername(username) {
  if (typeof username !== 'string') return false;
  const sanitized = username.trim();
  // Username: 3-50 chars, alphanumeric, underscore, hyphen
  const usernameRegex = /^[a-zA-Z0-9_-]{3,50}$/;
  return usernameRegex.test(sanitized);
}

// Validate password strength
function validatePassword(password) {
  if (typeof password !== 'string') return false;
  // At least 8 chars, contains letter and number
  return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

// Validate role
function validateRole(role) {
  const validRoles = ['admin', 'landlord', 'tenant'];
  return validRoles.includes(role);
}

// Validate phone number (basic format)
function validatePhoneNumber(phone) {
  if (typeof phone !== 'string') return false;
  // Remove common formatting characters
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');
  // Should be 10-15 digits
  return /^\d{10,15}$/.test(cleaned);
}

// Validate string length
function validateLength(str, min, max) {
  if (typeof str !== 'string') return false;
  const length = str.trim().length;
  return length >= min && length <= max;
}

// Validate numeric range
function validateNumber(num, min, max) {
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return false;
  return numValue >= min && numValue <= max;
}

// Validate and sanitize listing title
function validateListingTitle(title) {
  if (!title || typeof title !== 'string') return null;
  const sanitized = sanitizeString(title);
  if (!validateLength(sanitized, 1, 100)) return null;
  return sanitized;
}

// Validate and sanitize listing description
function validateListingDescription(description) {
  if (!description || typeof description !== 'string') return null;
  const sanitized = sanitizeText(description);
  if (!validateLength(sanitized, 0, 5000)) return null;
  return sanitized;
}

// Validate price
function validatePrice(price) {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return null;
  if (!validateNumber(numPrice, 0, 999999.99)) return null;
  return numPrice;
}

// Validate address fields
function validateAddressField(field, maxLength = 255) {
  if (!field || typeof field !== 'string') return null;
  const sanitized = sanitizeString(field);
  if (!validateLength(sanitized, 0, maxLength)) return null;
  return sanitized || null;
}

// Validate ZIP code
function validateZipCode(zip) {
  if (!zip || typeof zip !== 'string') return null;
  const sanitized = sanitizeString(zip);
  // Allow alphanumeric ZIP codes (international format)
  if (!validateLength(sanitized, 0, 16)) return null;
  return sanitized || null;
}

// Validate boolean
function validateBoolean(value) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return false;
}

// Validate integer
function validateInteger(value, min = null, max = null) {
  const intValue = typeof value === 'string' ? parseInt(value, 10) : value;
  if (!Number.isInteger(intValue)) return null;
  if (min !== null && intValue < min) return null;
  if (max !== null && intValue > max) return null;
  return intValue;
}

module.exports = {
  sanitizeString,
  sanitizeText,
  validateEmail,
  validateUsername,
  validatePassword,
  validateRole,
  validatePhoneNumber,
  validateLength,
  validateNumber,
  validateListingTitle,
  validateListingDescription,
  validatePrice,
  validateAddressField,
  validateZipCode,
  validateBoolean,
  validateInteger,
};

