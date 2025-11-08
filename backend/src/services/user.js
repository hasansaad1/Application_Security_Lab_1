const pool = require("../db");
const { Listing } = require("./listings");
const { encryptJSON, decryptToJSON } = require("../crypto");

// Entities
class User {
  constructor({ id, username, email, password_hash, role, profile_picture_path, phone_number }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.password_hash = password_hash;
    this.role = role;
    this.profile_picture_path = profile_picture_path;
    this.phone_number = phone_number;
  }
}

// Functions

// Get user by email
async function getUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?;", [email]);
  if (!rows.length) return null;

  const user = new User(rows[0]);
  try {
    const parsed = JSON.parse(user.phone_number);
    const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
    user.phone_number = decrypted.phone_number;
  } catch (e) {
    console.warn("Could not decrypt phone number:", e.message);
  }
  return user;
}

// Create new user
async function createUser(user) {
  const { encrypted, iv, tag } = encryptJSON({ phone_number: user.phone_number });
  const encryptedPhone = JSON.stringify({ encrypted, iv, tag });

  const [result] = await pool.query(
    `INSERT INTO Users (username, email, password_hash, role, profile_picture_path, phone_number)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [user.username, user.email, user.password_hash, user.role, user.profile_picture_path, encryptedPhone]
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

// Get listings by owner
async function getListingsByOwner(ownerId) {
  const [rows] = await pool.query(`SELECT * FROM Listings WHERE owner_id = ?`, [ownerId]);
  return rows.map(r => new Listing(r));
}

module.exports = {
  User,
  getUserByEmail,
  createUser,
  getUsers,
  getListingsByOwner
};