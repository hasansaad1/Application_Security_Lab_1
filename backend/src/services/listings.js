const pool = require("../db");
const { decryptToJSON } = require("../crypto");
const { Listing } = require("../models/listing");

// Functions

// Get all listings with pagination
async function getListings(page = 1, limit = 10) {
  // Validate and normalize pagination parameters
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10)); // Max 100 items per page
  const offset = (pageNum - 1) * limitNum;

  // Get total count of listings
  const [countResult] = await pool.query("SELECT COUNT(*) as total FROM Listings;");
  const total = countResult[0].total;

  // Get paginated listings
  const [rows] = await pool.query(
    "SELECT * FROM Listings ORDER BY publication_date DESC LIMIT ? OFFSET ?;",
    [limitNum, offset]
  );
  const listings = rows.map(r => new Listing(r));
  
  // Fetch images for each listing
  for (const listing of listings) {
    const [images] = await pool.query(
      "SELECT path FROM ListingsImages WHERE listing_id = ?;",
      [listing.id]
    );
    listing.images = images;
  }
  
  return {
    listings,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    }
  };
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

// Save listing images to database
async function saveListingImages(listingId, imagePaths) {
  if (!imagePaths || imagePaths.length === 0) {
    return;
  }

  const values = imagePaths.map(path => [listingId, path]);
  await pool.query(
    "INSERT INTO ListingsImages (listing_id, path) VALUES ?",
    [values]
  );
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
  const listings = rows.map(r => new Listing(r));
  
  // Fetch images for each listing
  for (const listing of listings) {
    const [images] = await pool.query(
      "SELECT path FROM ListingsImages WHERE listing_id = ?;",
      [listing.id]
    );
    listing.images = images;
  }
  
  return listings;
}

// Update listing by ID
async function updateListing(id, updates) {
  // Build dynamic UPDATE query based on provided fields
  const allowedFields = [
    'title', 'description', 'price', 'address_country', 'address_province',
    'address_city', 'address_zip_code', 'address_line1', 'address_line2', 'is_available'
  ];
  
  const fields = [];
  const values = [];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (fields.length === 0) {
    throw new Error("No valid fields to update");
  }
  
  values.push(id);
  
  const [result] = await pool.query(
    `UPDATE Listings SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  
  if (result.affectedRows === 0) {
    throw new Error("Listing not found");
  }
  
  return await getListingById(id);
}

// Delete listing by ID
async function deleteListing(id) {
  // First, delete all related records that reference this listing
  // Delete from ListingFollowers (favorites)
  await pool.query("DELETE FROM ListingFollowers WHERE listing_id = ?", [id]);
  
  // Delete from ListingsImages
  await pool.query("DELETE FROM ListingsImages WHERE listing_id = ?", [id]);
  
  // Finally, delete the listing itself
  const [result] = await pool.query("DELETE FROM Listings WHERE id = ?", [id]);
  
  if (result.affectedRows === 0) {
    throw new Error("Listing not found");
  }
  
  return true;
}

// Check if user has favorited a listing
async function isListingFavorited(userId, listingId) {
  const [rows] = await pool.query(
    "SELECT id FROM ListingFollowers WHERE user_id = ? AND listing_id = ?",
    [userId, listingId]
  );
  return rows.length > 0;
}

// Add listing to favorites
async function addToFavorites(userId, listingId) {
  // Check if already favorited
  const alreadyFavorited = await isListingFavorited(userId, listingId);
  if (alreadyFavorited) {
    return true; // Already favorited, return success
  }

  await pool.query(
    "INSERT INTO ListingFollowers (user_id, listing_id) VALUES (?, ?)",
    [userId, listingId]
  );
  return true;
}

// Remove listing from favorites
async function removeFromFavorites(userId, listingId) {
  const [result] = await pool.query(
    "DELETE FROM ListingFollowers WHERE user_id = ? AND listing_id = ?",
    [userId, listingId]
  );
  return result.affectedRows > 0;
}

// Get all favorite listings for a user
async function getFavoriteListings(userId) {
  const [rows] = await pool.query(
    `SELECT L.*, U.username AS owner_username
     FROM Listings L
     JOIN ListingFollowers LF ON L.id = LF.listing_id
     JOIN Users U ON L.owner_id = U.id
     WHERE LF.user_id = ?;`,
    [userId]
  );

  const listings = rows.map(r => new Listing(r));
  
  // Fetch images for each listing
  for (const listing of listings) {
    const [images] = await pool.query(
      "SELECT path FROM ListingsImages WHERE listing_id = ?;",
      [listing.id]
    );
    listing.images = images;
  }
  
  return listings;
}

module.exports = {
  Listing,
  getListings,
  getListingById,
  createListing,
  getPhoneNumber,
  getListingsByOwner,
  updateListing,
  deleteListing,
  saveListingImages,
  isListingFavorited,
  addToFavorites,
  removeFromFavorites,
  getFavoriteListings
};