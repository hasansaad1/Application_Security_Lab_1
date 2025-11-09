const express = require("express");
const router = express.Router();
const { getListings, getListingById, createListing, getPhoneNumber, getListingsByOwner } = require("../services/listings");

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

// Create a new listing
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.owner_id || !payload.title || payload.price == null) {
      return res.status(400).json({ error: "Missing required fields: owner_id, title, price" });
    }
    const insertId = await createListing(payload);
    const created = await getListingById(insertId);
    res.status(201).json({ message: "Listing created", listing: created });
  } catch (err) {
    console.error("Error creating listing:", err);
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

module.exports = router;