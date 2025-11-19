const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');

const config = require("../config");
const { auth } = require("../middleware/auth");
const { uploadProfilePicture } = require("../middleware/upload/profilePicture");
const userService = require("../services/user");
const {
  validateEmail,
  validateUsername,
  validatePassword,
  validateRole,
  validatePhoneNumber,
  sanitizeString,
} = require("../utils/validation");

const router = express.Router();

const COOKIE_SETTINGS = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
  path: '/',
  maxAge: 1000 * 60 * 60, // 1 hour
};

function signToken(user) {
  return jwt.sign({
      sub: user.id,
      email: user.email,
      role: user.role,
    }, config.auth.jwtSecret, { expiresIn: config.auth.jwtExpiresIn }
  );
};

router.post("/register", uploadProfilePicture, async (req, res) => {
  try {
    const { username, email, password, role, phone_number } = req.body;

    /* Validations */
    if (!username || !email || !password || !role || !phone_number) {
      return res.status(400).json({ error: "Missing required fields: username, email, password, role, phone_number" });
    }

    // Validate and sanitize inputs
    const sanitizedUsername = sanitizeString(username);
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    const sanitizedPhone = sanitizeString(phone_number);

    if (!validateUsername(sanitizedUsername)) {
      return res.status(400).json({ error: "Invalid username. Username must be 3-50 characters and contain only letters, numbers, underscores, or hyphens" });
    }

    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ error: "Password must be at least 8 characters and contain both letters and numbers" });
    }

    if (!validateRole(role)) {
      return res.status(400).json({ error: "Invalid role. Must be one of: admin, landlord, tenant" });
    }

    if (!validatePhoneNumber(sanitizedPhone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }
    
    /* Save profile picture if included */
    let profile_picture_path = null;
    if (req.file) {
        profile_picture_path = path.relative(config.uploads.root, req.file.path);
    }
    
    /* Hash password */
    const password_hash = await bcrypt.hash(password, 10);

    /* Create user */
    const user = await userService.createUser({
        username: sanitizedUsername,
        email: sanitizedEmail,
        password_hash,
        role,
        profile_picture_path,
        phone_number: sanitizedPhone
    });

    /* Generate JWT and store it in cookie */
    const token = signToken(user);
    res.cookie('token', token, COOKIE_SETTINGS);

    res.status(201).json({
      success: true,
      data: {
        user: user.toJSON()
      }
    });
  } catch (err) {
    console.error("Error creating user:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "User with same username or email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    /* Validations */
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Sanitize email
    const sanitizedEmail = sanitizeString(email).toLowerCase();
    
    if (!validateEmail(sanitizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: "Password is required" });
    }
    
    const user = await userService.getUserByEmail(sanitizedEmail);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validCredentials = await bcrypt.compare(password, user.password_hash);
    if (!validCredentials) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    /* Generate JWT and store it in cookie */
    const token = signToken(user);
    res.cookie('token', token, COOKIE_SETTINGS);

    res.status(200).json({
      data: {
        user: user.toJSON()
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/me", auth(), async (req, res) => {
  try {
    const user = await userService.getUserByEmail(req.user.email);
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    };

    res.json({ data: { user } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post("/logout", async (req, res) => {
  const { maxAge, ...settings } =  COOKIE_SETTINGS;
  res.clearCookie('token', settings);
  return res.json({ success: true });
});

module.exports = router;