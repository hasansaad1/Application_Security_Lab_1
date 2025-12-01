const express = require("express");
const path = require("path");

const { getUserById, updateUser } = require("../services/user");
const { sanitizeString, validateEmail, validateUsername, validatePhoneNumber } = require("../utils/validation");
const { uploadProfilePicture } = require("../middleware/upload/profilePicture");
const config = require("../config");

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

// Update current user's profile (authenticated users only)
// Authentication is handled by the firewall middleware via route policies
router.put("/me", uploadProfilePicture, async (req, res) => {
  try {
    const userId = req.user.sub;
    const updates = {};

    // Validate and update username
    if (req.body.username !== undefined) {
      const sanitizedUsername = sanitizeString(req.body.username);
      if (!validateUsername(sanitizedUsername)) {
        return res.status(400).json({ 
          error: "Invalid username. Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens" 
        });
      }
      updates.username = sanitizedUsername;
    }

    // Validate and update email
    if (req.body.email !== undefined) {
      const sanitizedEmail = sanitizeString(req.body.email).toLowerCase();
      if (!validateEmail(sanitizedEmail)) {
        return res.status(400).json({ error: "Invalid email format" });
      }
      updates.email = sanitizedEmail;
    }

    // Validate and update phone number
    if (req.body.phone_number !== undefined) {
      const sanitizedPhone = sanitizeString(req.body.phone_number);
      if (!validatePhoneNumber(sanitizedPhone)) {
        return res.status(400).json({ 
          error: "Invalid phone number format. Phone number must contain 7-20 digits" 
        });
      }
      updates.phone_number = sanitizedPhone;
    }

    // Handle profile picture upload
    if (req.file) {
      updates.profile_picture_path = path.relative(config.uploads.root, req.file.path);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const updatedUser = await updateUser(userId, updates);
    res.json({
      success: true,
      data: {
        user: updatedUser.toJSON()
      }
    });
  } catch (err) {
    console.error("Error updating user:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "User with same username or email already exists" });
    }
    if (err.message === "No valid fields to update") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;