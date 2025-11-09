const express = require("express");
const router = express.Router();
const { getUsers, getUserByEmail, createUser } = require("../services/user");

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
    const user = await getUserByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("Error fetching user:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new user
router.post("/", async (req, res) => {
  try {
    const { username, email, password_hash, role, profile_picture_path = null, phone_number } = req.body;

    if (!username || !email || !password_hash || !role || !phone_number) {
      return res.status(400).json({ error: "Missing required fields: username, email, password_hash, role, phone_number" });
    }

    const created = await createUser({ username, email, password_hash, role, profile_picture_path, phone_number });
    res.status(201).json({ message: "User created", user: created });
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "User with same username or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;