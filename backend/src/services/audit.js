// backend/src/services/audit.js
const db = require("../db");

/**
 * Insert an audit log entry
 * @param {number|null} userId - ID of the user, or null if unknown
 * @param {string} action - Description of the action
 * @param {string} ip - IP address of the user
 */
async function logAudit(userId, action, ip) {
  try {
    const timestamp = new Date();
    await db.query(
      "INSERT INTO AuditLogs (user_id, action, ip_address, timestamp) VALUES (?, ?, ?, ?)",
      [userId, action, ip, timestamp]
    );
  } catch (err) {
    console.error("Failed to insert audit log:", err);
  }
}

// --- Specific audit functions for convenience ---

/** Login */
async function logLoginSuccess(userId, ip) {
  await logAudit(userId, "login_success", ip);
}

async function logLoginFail(email, ip) {
  // userId unknown on failed login, store email in action
  await logAudit(null, `login_fail: ${email}`, ip);
}

/** Listing actions */
async function logListingCreate(userId, listingId, ip) {
  await logAudit(userId, `listing_create: ${listingId}`, ip);
}

async function logListingUpdate(userId, listingId, ip) {
  await logAudit(userId, `listing_update: ${listingId}`, ip);
}

async function logListingDelete(userId, listingId, ip) {
  await logAudit(userId, `listing_delete: ${listingId}`, ip);
}

/** Phone approval actions */
async function logPhoneApprove(userId, phoneId, ip) {
  await logAudit(userId, `phone_approve: ${phoneId}`, ip);
}

async function logPhoneReject(userId, phoneId, ip) {
  await logAudit(userId, `phone_reject: ${phoneId}`, ip);
}

/** File uploads */
async function logFileUploadMagicBytes(userId, ip) {
  await logAudit(userId, `file_upload_wong_magic_bytes`, ip);
}

module.exports = {
  logAudit,
  logLoginSuccess,
  logLoginFail,
  logListingCreate,
  logListingUpdate,
  logListingDelete,
  logPhoneApprove,
  logPhoneReject,
  logFileUploadMagicBytes
};
