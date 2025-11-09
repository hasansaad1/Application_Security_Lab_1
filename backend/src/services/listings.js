const pool = require("../db");
const { decryptToJSON } = require("../crypto");

// Entities
class Listing {
  constructor({ id, owner_id, title, description, price, address_country, address_province, address_city, address_zip_code, address_line1, address_line2, is_available, publication_date }) {
    this.id = id;
    this.owner_id = owner_id;
    this.title = title;
    this.description = description;
    this.price = price;
    this.address_country = address_country;
    this.address_province = address_province;
    this.address_city = address_city;
    this.address_zip_code = address_zip_code;
    this.address_line1 = address_line1;
    this.address_line2 = address_line2;
    this.is_available = is_available;
    this.publication_date = publication_date || new Date();
  }
}

// Functions

// Get all listings
async function getListings() {
  const [rows] = await pool.query("SELECT * FROM Listings;");
  return rows.map(r => new Listing(r));
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

  const listing = new Listing(rows[0]);
  listing.images = images;
  return listing;
}

// Create new listing
async function createListing(listing) {
  const [result] = await pool.query(
    `INSERT INTO Listings (owner_id, title, description, price,
      address_country, address_province, address_city,
      address_zip_code, address_line1, address_line2, is_available, publication_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [listing.owner_id, listing.title, listing.description, listing.price, listing.address_country, listing.address_province, listing.address_city, listing.address_zip_code, listing.address_line1, listing.address_line2, listing.is_available, listing.publication_date]
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

// Get listings by owner
async function getListingsByOwner(ownerId) {
  const [rows] = await pool.query(`SELECT * FROM Listings WHERE owner_id = ?`, [ownerId]);
  return rows.map(r => new Listing(r));
}

module.exports = {
  Listing,
  getListings,
  getListingById,
  createListing,
  getPhoneNumber,
  getListingsByOwner
};