const { pool } = require("./config");

// Get user by email
async function getUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?;", [email]);
  return rows[0];
}

// Create new user
async function createUser({ username, email, password_hash, role, profile_picture_path, phone_number }) {
  const [result] = await pool.query(
    `INSERT INTO Users (username, email, password_hash, role, profile_picture_path, phone_number)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [username, email, password_hash, role, profile_picture_path, phone_number]
  );
  const [rows] = await pool.query(`SELECT * FROM Users WHERE id = ?;`, [result.insertId]);
  return rows[0];
}

// Get all users
async function getUsers() {
  const [rows] = await pool.query("SELECT * FROM Users;");
  return rows;
}

// Get all listings
async function getListings() {
  const [rows] = await pool.query("SELECT * FROM Listings;");
  return rows;
}

// Get listing by ID
async function getListingById(id) {
  const [rows] = await pool.query(
    `SELECT L.*, U.username AS owner_username
     FROM Listings L
     JOIN Users U ON L.owner_id = U.id
     WHERE L.id = ?;`,
    [id]
  );

  const [images] = await pool.query(
    "SELECT path FROM ListingsImages WHERE listing_id = ?;",
    [id]
  );

  return { ...rows[0], images };
}

// Get listings by owner
async function getListingsByOwner(ownerId) {
  const [rows] = await pool.query(
    `SELECT * FROM Listings WHERE owner_id = ?`,
    [ownerId]
  );
  return rows;
}

// Create new listing
async function createListing({
  owner_id, title, description, price,
  address_country, address_province, address_city,
  address_zip_code, address_line1, address_line2, is_available, publication_date = new Date()
}) {
  const [result] = await pool.query(
    `INSERT INTO Listings (owner_id, title, description, price,
      address_country, address_province, address_city,
      address_zip_code, address_line1, address_line2, is_available, publication_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [owner_id, title, description, price,
     address_country, address_province, address_city,
     address_zip_code, address_line1, address_line2, is_available, publication_date]
  );
  return result.insertId;
}

module.exports = {
  getUserByEmail,
  createUser,
  getUsers,
  getListings,
  getListingById,
  getListingsByOwner,
  createListing
};
