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

app.get("/health", async(req, res) => {
    // do app logic here to determine if app is truly healthy
    // you should return 200 if healthy, and anything else will fail
    // if you want, you should be able to restrict this to localhost
    try {
      const testUser = await db.getUserByEmail("admin.john@homigo.com");
      const existingUser = await db.getUserByEmail("pep.landlord@homigo.com");

      const newUser = existingUser || await db.createUser({
        username: "landlord_pep",
        email: "pep.landlord@homigo.com",
        password_hash: "hashed_pw_def",
        role: "landlord",
        phone_number: "+1-555-999-0000"
      });

      const listingsByOwner = await db.getListingsByOwner(newUser.id);
      const existingListing = listingsByOwner.find(l => l.title === "Mountain House");

      if (!existingListing) {
        await db.createListing({
          owner_id: newUser.id,
          title: "Mountain House",
          description: "Tree house at the top of the mountain.",
          price: 999.99,
          address_country: "USA",
          address_province: "California",
          address_city: "Los Angeles",
          address_zip_code: "90001",
          address_line1: "456 Test St",
          address_line2: null,
          is_available: 1
        });
      }

      const allUsers = await db.getUsers();
      const allListings = await db.getListings();
      const singleListing = await db.getListingById(1);
      const listingsByOwnerAfter = await db.getListingsByOwner(newUser.id);

      res.status(200).json({
        status: "healthy",
        db: "HomigoDB",
        test_results: {
          getUserByEmail: testUser,
          getUsers: allUsers,
          getListings: allListings,
          getListingById: singleListing,
          getListingsByOwner: listingsByOwnerAfter
        }
      });
    } catch (err) {
      console.error("DB connection failed:", err);
      res.status(500).json({
        status: "unhealthy",
        error: err.message
      });
    }
});

module.exports = app;