const pool = require("../db");
const { User } = require("../models/user");
const { encryptJSON, decryptToJSON } = require("../crypto");

// Get user by email
async function getUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?;", [email]);
  if (!rows.length) {
    return null;
  }

  const userData = { ...rows[0] };
  // Remove role field if it exists (for backward compatibility)
  delete userData.role;

  const user = new User(userData);
  try {
    const parsed = JSON.parse(user.phone_number);
    const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
    user.phone_number = decrypted.phone_number;
  } catch (e) {
    console.warn("Could not decrypt phone number:", e.message);
  }
  return user; // TODO: check security and limitations of usage
}

// Create new user
async function createUser(user) {
  const { encrypted, iv, tag } = encryptJSON({ phone_number: user.phone_number });
  const encryptedPhone = JSON.stringify({ encrypted, iv, tag });

  const [result] = await pool.query(
    `INSERT INTO Users (username, email, password_hash, profile_picture_path, phone_number)
     VALUES (?, ?, ?, ?, ?);`,
    [user.username, user.email, user.password_hash, user.profile_picture_path, encryptedPhone]
  );

  const [rows] = await pool.query(`SELECT * FROM Users WHERE id = ?;`, [result.insertId]);
  const createdUser = new User(rows[0]);

  const parsed = JSON.parse(createdUser.phone_number);
  const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
  createdUser.phone_number = decrypted.phone_number;

  return createdUser;
}

// Get all users
async function getUsers() {
  const [rows] = await pool.query("SELECT * FROM Users;");
  return rows.map(r => {
    const user = new User(r);
    try {
      const parsed = JSON.parse(user.phone_number);
      const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
      user.phone_number = decrypted.phone_number;
    } catch (e) {
      console.warn("Could not decrypt phone number for user", user.id);
    }
    return user;
  });
}

module.exports = {
  getUserByEmail,
  createUser,
  getUsers
};