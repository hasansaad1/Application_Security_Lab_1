const { pool } = require("./config");
const { encryptJSON, decryptToJSON } = require('./crypto');

// Get user by email
async function getUserByEmail(email) {
  const [rows] = await pool.query("SELECT * FROM Users WHERE email = ?;", [email]);
  if (!rows.length) return null;

  const user = rows[0];
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
async function createUser({ username, email, password_hash, role, profile_picture_path, phone_number }) {
  const { encrypted, iv, tag } = encryptJSON({ phone_number });

  const encryptedPhone = JSON.stringify({ encrypted, iv, tag });

  const [result] = await pool.query(
    `INSERT INTO Users (username, email, password_hash, role, profile_picture_path, phone_number)
     VALUES (?, ?, ?, ?, ?, ?);`,
    [username, email, password_hash, role, profile_picture_path, encryptedPhone]
  );

  const [rows] = await pool.query(`SELECT * FROM Users WHERE id = ?;`, [result.insertId]);
  const user = rows[0];

  const parsed = JSON.parse(user.phone_number);
  const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
  user.phone_number = decrypted.phone_number;

  return user;
}

// Get all users
async function getUsers() {
  const [rows] = await pool.query("SELECT * FROM Users;");
  return rows.map(u => {
    try {
      const parsed = JSON.parse(u.phone_number);
      const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
      u.phone_number = decrypted.phone_number;
    } catch (e) {
      console.warn("Could not decrypt phone number for user", u.id);
    }
    return u;
  });
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

// Get decrypted phone number of the listing owner
async function getPhoneNumber(listing_id) {
  const [listingRows] = await pool.query(
    "SELECT owner_id FROM Listings WHERE id = ?;",
    [listing_id]
  );
  if (!listingRows.length) throw new Error("Listing not found");
  const owner_id = listingRows[0].owner_id;

  const [ownerRows] = await pool.query(
    "SELECT phone_number FROM Users WHERE id = ?;",
    [owner_id]
  );
  if (!ownerRows.length) throw new Error("Owner not found");

  const encryptedData = ownerRows[0].phone_number;

  try {
    const parsed = JSON.parse(encryptedData);
    const decrypted = decryptToJSON(parsed.encrypted, parsed.iv, parsed.tag);
    return {
      owner_id,
      listing_id,
      phone_number: decrypted.phone_number
    };
  } catch (err) {
    console.error("Error decrypting phone number:", err);
    throw new Error("Failed to decrypt phone number");
  }
}

module.exports = {
  getUserByEmail,
  createUser,
  getUsers,
  getListings,
  getListingById,
  getListingsByOwner,
  createListing,
  getPhoneNumber
};
