const express = require("express");
const { auth } = require("../middleware/auth");
const { getUsers, getUserByEmail, getUserById } = require("../services/user");
const { validateEmail, sanitizeString } = require("../utils/validation");

const router = express.Router();

// List all users
router.get("/", async (req, res) => {
  try {
    const users = await getUsers();
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by email
router.get("/:email", async (req, res) => {
  try {
    // Validate and sanitize email parameter
    const sanitizedEmail = sanitizeString(req.params.email).toLowerCase();
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    const user = await getUserByEmail(sanitizedEmail);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user by ID
router.get("/id/:id", auth(), async (req, res) => {
  try {
    const rawId = sanitizeString(req.params.id);
    const userId = Number(rawId);

    if (isNaN(userId) || userId <= 0) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await getUserById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;