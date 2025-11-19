const express = require("express");
const router = express.Router();
const path = require("path");
const { auth } = require("../middleware/auth");
const { uploadListingImages } = require("../middleware/upload/listingImages");
const { uploadErrorHandler } = require("../middleware/upload/errorHandler");
const config = require("../config");
const { assertOwner } = require("../utils/ownership");
const {
  validateListingTitle,
  validateListingDescription,
  validatePrice,
  validateAddressField,
  validateZipCode,
  validateBoolean,
  validateInteger,
} = require("../utils/validation");
const { getListings, getListingById, createListing, getPhoneNumber, getListingsByOwner, updateListing, deleteListing, saveListingImages, isListingFavorited, addToFavorites, removeFromFavorites, getFavoriteListings } = require("../services/listings");

// List all listings (with pagination)
router.get("/", async (req, res) => {
  try {
    // Validate pagination parameters
    const page = req.query.page ? validateInteger(req.query.page, 1) : 1;
    const limit = req.query.limit ? validateInteger(req.query.limit, 1, 100) : 10;
    
    const result = await getListings(page, limit);
    res.json(result);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new listing
router.post("/", uploadListingImages, async (req, res) => {
  try {
    // Validate and sanitize owner_id
    const owner_id = validateInteger(req.body.owner_id, 1);
    if (!owner_id) {
      return res.status(400).json({ error: "Invalid or missing owner_id" });
    }

    // Validate and sanitize title
    const title = validateListingTitle(req.body.title);
    if (!title) {
      return res.status(400).json({ error: "Title is required and must be 1-100 characters" });
    }

    // Validate and sanitize price
    const price = validatePrice(req.body.price);
    if (price === null) {
      return res.status(400).json({ error: "Valid price is required (0-999999.99)" });
    }

    // Validate and sanitize description
    const description = validateListingDescription(req.body.description);

    // Validate and sanitize address fields
    const address_country = validateAddressField(req.body.address_country, 255);
    const address_province = validateAddressField(req.body.address_province, 255);
    const address_city = validateAddressField(req.body.address_city, 255);
    const address_zip_code = validateZipCode(req.body.address_zip_code);
    const address_line1 = validateAddressField(req.body.address_line1, 255);
    const address_line2 = validateAddressField(req.body.address_line2, 255);

    // Validate boolean
    const is_available = req.body.is_available !== undefined 
      ? validateBoolean(req.body.is_available) 
      : true;

    const payload = {
      owner_id,
      title,
      description,
      price,
      address_country,
      address_province,
      address_city,
      address_zip_code,
      address_line1,
      address_line2,
      is_available,
      publication_date: new Date()
    };

    // Create the listing
    const insertId = await createListing(payload);

    // Save images if any were uploaded
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => 
        path.relative(config.uploads.root, file.path)
      );
      await saveListingImages(insertId, imagePaths);
    }

    const created = await getListingById(insertId);
    res.status(201).json({ message: "Listing created", listing: created });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}, uploadErrorHandler);

// Get current user's listings (must come before /:id route)
router.get("/my", auth(), async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const listings = await getListingsByOwner(currentUserId);
    res.json(listings);
  } catch (err) {
    console.error("Error fetching user listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get current user's favorite listings (must come before /:id route)
router.get("/favorites", auth(), async (req, res) => {
  try {
    const currentUserId = req.user.sub;
    const listings = await getFavoriteListings(currentUserId);
    res.json(listings);
  } catch (err) {
    console.error("Error fetching favorite listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get listings by owner id
router.get("/owner/:id", async (req, res) => {
  try {
    const ownerId = validateInteger(req.params.id, 1);
    if (!ownerId) {
      return res.status(400).json({ error: "Invalid owner id" });
    }
    const listings = await getListingsByOwner(ownerId);
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings by owner:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Check if listing is favorited by current user (must come before /:id route)
router.get("/:id/favorite", auth(), async (req, res) => {
  try {
    const listingId = validateInteger(req.params.id, 1);
    if (!listingId) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    const userId = req.user.sub;
    const favorited = await isListingFavorited(userId, listingId);
    res.json({ favorited });
  } catch (err) {
    console.error("Error checking favorite status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add listing to favorites (must come before /:id route)
router.post("/:id/favorite", auth(), async (req, res) => {
  try {
    const listingId = validateInteger(req.params.id, 1);
    if (!listingId) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    // Verify listing exists
    const listing = await getListingById(listingId);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    const userId = req.user.sub;
    await addToFavorites(userId, listingId);
    res.status(200).json({ message: "Listing added to favorites" });
  } catch (err) {
    console.error("Error adding to favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Remove listing from favorites (must come before /:id route)
router.delete("/:id/favorite", auth(), async (req, res) => {
  try {
    const listingId = validateInteger(req.params.id, 1);
    if (!listingId) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    const userId = req.user.sub;
    const removed = await removeFromFavorites(userId, listingId);
    if (!removed) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.status(200).json({ message: "Listing removed from favorites" });
  } catch (err) {
    console.error("Error removing from favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get listing by id
router.get("/:id", async (req, res) => {
  try {
    const id = validateInteger(req.params.id, 1);
    if (!id) {
      return res.status(400).json({ error: "Invalid listing id" });
    }
    const listing = await getListingById(id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get decrypted phone number of the listing owner
router.get("/:id/phone", async (req, res) => {
  try {
    const listing_id = validateInteger(req.params.id, 1);
    if (!listing_id) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    const result = await getPhoneNumber(listing_id);
    res.status(200).json({
      message: "Owner phone retrieved successfully",
      data: result
    });
  } catch (err) {
    console.error("Error fetching phone number:", err);
    if (err.message === "Listing not found" || err.message === "Owner not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update listing by id (owner only)
router.put("/:id", auth(), async (req, res) => {
  try {
    const id = validateInteger(req.params.id, 1);
    if (!id) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    // Get the listing to check ownership
    const listing = await getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Assert ownership
    assertOwner(listing.owner_id, req.user.sub, "listing");

    // Validate and sanitize update fields
    const updates = {};
    
    if (req.body.title !== undefined) {
      const title = validateListingTitle(req.body.title);
      if (!title) {
        return res.status(400).json({ error: "Title must be 1-100 characters" });
      }
      updates.title = title;
    }

    if (req.body.description !== undefined) {
      updates.description = validateListingDescription(req.body.description);
    }

    if (req.body.price !== undefined) {
      const price = validatePrice(req.body.price);
      if (price === null) {
        return res.status(400).json({ error: "Valid price is required (0-999999.99)" });
      }
      updates.price = price;
    }

    if (req.body.address_country !== undefined) {
      updates.address_country = validateAddressField(req.body.address_country, 255);
    }

    if (req.body.address_province !== undefined) {
      updates.address_province = validateAddressField(req.body.address_province, 255);
    }

    if (req.body.address_city !== undefined) {
      updates.address_city = validateAddressField(req.body.address_city, 255);
    }

    if (req.body.address_zip_code !== undefined) {
      updates.address_zip_code = validateZipCode(req.body.address_zip_code);
    }

    if (req.body.address_line1 !== undefined) {
      updates.address_line1 = validateAddressField(req.body.address_line1, 255);
    }

    if (req.body.address_line2 !== undefined) {
      updates.address_line2 = validateAddressField(req.body.address_line2, 255);
    }

    if (req.body.is_available !== undefined) {
      updates.is_available = validateBoolean(req.body.is_available);
    }

    // Update the listing
    const updated = await updateListing(id, updates);
    res.status(200).json({ message: "Listing updated", listing: updated });
  } catch (err) {
    console.error("Error updating listing:", err);
    if (err.message === "Listing not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Forbidden: You are not the owner of this listing") {
      return res.status(403).json({ error: err.message });
    }
    if (err.message === "No valid fields to update") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete listing by id (owner only)
router.delete("/:id", auth(), async (req, res) => {
  try {
    const id = validateInteger(req.params.id, 1);
    if (!id) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    // Get the listing to check ownership
    const listing = await getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Assert ownership
    assertOwner(listing.owner_id, req.user.sub, "listing");

    // Delete the listing
    await deleteListing(id);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Error deleting listing:", err);
    if (err.message === "Listing not found") {
      return res.status(404).json({ error: err.message });
    }
    if (err.message === "Forbidden: You are not the owner of this listing") {
      return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;