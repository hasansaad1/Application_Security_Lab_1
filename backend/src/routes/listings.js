const express = require("express");
const router = express.Router();
const path = require("path");
const { auth } = require("../middleware/auth");
const { uploadListingImages } = require("../middleware/upload/listingImages");
const { uploadErrorHandler } = require("../middleware/upload/errorHandler");
const config = require("../config");
const { getListings, getListingById, createListing, getPhoneNumber, getListingsByOwner, updateListing, deleteListing, saveListingImages } = require("../services/listings");

// List all listings
router.get("/", async (req, res) => {
  try {
    const listings = await getListings();
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new listing
router.post("/", uploadListingImages, async (req, res) => {
  try {
    const payload = {
      owner_id: req.body.owner_id ? parseInt(req.body.owner_id) : null,
      title: req.body.title,
      description: req.body.description || null,
      price: req.body.price ? parseFloat(req.body.price) : null,
      address_country: req.body.address_country || null,
      address_province: req.body.address_province || null,
      address_city: req.body.address_city || null,
      address_zip_code: req.body.address_zip_code || null,
      address_line1: req.body.address_line1 || null,
      address_line2: req.body.address_line2 || null,
      is_available: req.body.is_available !== undefined ? req.body.is_available === 'true' || req.body.is_available === true : true,
      publication_date: new Date()
    };

    // Validate required fields
    if (!payload.owner_id || !payload.title || payload.price == null) {
      return res.status(400).json({ error: "Missing required fields: owner_id, title, price" });
    }

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

// Get listings by owner id
router.get("/owner/:id", async (req, res) => {
  try {
    const ownerId = Number(req.params.id);
    if (!Number.isInteger(ownerId)) return res.status(400).json({ error: "Invalid user id" });
    const listings = await getListingsByOwner(ownerId);
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings by owner:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get listing by id
router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid listing id" });
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
    const listing_id = Number(req.params.id);
    if (!Number.isInteger(listing_id)) {
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
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    // Get the listing to check ownership
    const listing = await getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if current user is the owner
    const currentUserId = req.user.sub;
    if (listing.owner_id !== currentUserId) {
      return res.status(403).json({ error: "Forbidden: You are not the owner of this listing" });
    }

    // Update the listing
    const updated = await updateListing(id, req.body);
    res.status(200).json({ message: "Listing updated", listing: updated });
  } catch (err) {
    console.error("Error updating listing:", err);
    if (err.message === "Listing not found") {
      return res.status(404).json({ error: err.message });
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
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    // Get the listing to check ownership
    const listing = await getListingById(id);
    if (!listing) {
      return res.status(404).json({ error: "Listing not found" });
    }

    // Check if current user is the owner
    const currentUserId = req.user.sub;
    if (listing.owner_id !== currentUserId) {
      return res.status(403).json({ error: "Forbidden: You are not the owner of this listing" });
    }

    // Delete the listing
    await deleteListing(id);
    res.status(200).json({ message: "Listing deleted successfully" });
  } catch (err) {
    console.error("Error deleting listing:", err);
    if (err.message === "Listing not found") {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;