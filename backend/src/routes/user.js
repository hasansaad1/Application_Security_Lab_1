const express = require("express");

const { getUserById } = require("../services/user");
const { sanitizeString } = require("../utils/validation");

const router = express.Router();

// Get user by ID
router.get("/id/:id", async (req, res) => {
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