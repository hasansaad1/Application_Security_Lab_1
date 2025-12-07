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

// Get user by ID
async function getUserById(id) {
  // Query database
  const [rows] = await pool.query("SELECT * FROM Users WHERE id = ?;", [id]);

  if (!rows.length) {
    return null;
  }

  const userData = { ...rows[0] };
  // Remove role field if it exists (for backward compatibility)
  delete userData.role;

  const user = new User(userData);

  // Decrypt phone number
  try {
    const parsed = JSON.parse(user.phone_number);
    const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
    user.phone_number = decrypted.phone_number;
  } catch (e) {
    console.warn(`Could not decrypt phone number for user ${id}:`, e.message);
  }

  return user;
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

// Update user
async function updateUser(userId, updates) {
  const updateFields = [];
  const updateValues = [];

  // Handle username
  if (updates.username !== undefined) {
    updateFields.push("username = ?");
    updateValues.push(updates.username);
  }

  // Handle email
  if (updates.email !== undefined) {
    updateFields.push("email = ?");
    updateValues.push(updates.email);
  }

  // Handle phone_number (encrypt it)
  if (updates.phone_number !== undefined) {
    const { encrypted, iv, tag } = encryptJSON({ phone_number: updates.phone_number });
    const encryptedPhone = JSON.stringify({ encrypted, iv, tag });
    updateFields.push("phone_number = ?");
    updateValues.push(encryptedPhone);
  }

  // Handle profile_picture_path
  if (updates.profile_picture_path !== undefined) {
    updateFields.push("profile_picture_path = ?");
    updateValues.push(updates.profile_picture_path);
  }

  if (updateFields.length === 0) {
    throw new Error("No valid fields to update");
  }

  updateValues.push(userId);

  const query = `UPDATE Users SET ${updateFields.join(", ")} WHERE id = ?;`;
  await pool.query(query, updateValues);

  // Return updated user
  return getUserById(userId);
}

module.exports = {
  getUserByEmail,
  getUserById,
  createUser,
  getUsers,
  updateUser
};