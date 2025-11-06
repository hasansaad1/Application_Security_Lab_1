const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const cors = require("cors");
const { pool } = require("./config");
const db = require("./db");
const app = express();

app.use(morgan("dev"));
app.use(helmet());

// parse JSON bodies, with limit
app.use(express.json({ limit: '1mb' }));

const allowedOrigin = process.env.CORS_ORIGIN || '*'; //this is okay in local/dev
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);

// List all users
app.get("/users", async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by email
app.get("/users/:email", async (req, res) => {
  try {
    const user = await db.getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new user
app.post("/users", async (req, res) => {
  try {
    const { username, email, password_hash, role, profile_picture_path = null, phone_number } = req.body;

    if (!username || !email || !password_hash || !role || !phone_number) {
      return res.status(400).json({ error: "Missing required fields: username, email, password_hash, role, phone_number" });
    }

    const created = await db.createUser({ username, email, password_hash, role, profile_picture_path, phone_number });
    res.status(201).json({ message: "User created", user: created });
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "User with same username or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all listings
app.get("/listings", async (req, res) => {
  try {
    const listings = await db.getListings();
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get listing by id
app.get("/listings/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: "Invalid listing id" });
    const listing = await db.getListingById(id);
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    res.json(listing);
  } catch (err) {
    console.error("Error fetching listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get listings by owner id
app.get("/users/:id/listings", async (req, res) => {
  try {
    const ownerId = Number(req.params.id);
    if (!Number.isInteger(ownerId)) return res.status(400).json({ error: "Invalid user id" });
    const listings = await db.getListingsByOwner(ownerId);
    res.json(listings);
  } catch (err) {
    console.error("Error fetching listings by owner:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new listing
app.post("/listings", async (req, res) => {
  try {
    const payload = req.body;
    if (!payload.owner_id || !payload.title || payload.price == null) {
      return res.status(400).json({ error: "Missing required fields: owner_id, title, price" });
    }
    const insertId = await db.createListing(payload);
    const created = await db.getListingById(insertId);
    res.status(201).json({ message: "Listing created", listing: created });
  } catch (err) {
    console.error("Error creating listing:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get decrypted phone number of the listing owner
app.get("/listings/:id/phone", async (req, res) => {
  try {
    const listing_id = Number(req.params.id);
    if (!Number.isInteger(listing_id)) {
      return res.status(400).json({ error: "Invalid listing id" });
    }

    const result = await db.getPhoneNumber(listing_id);
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

module.exports = app;