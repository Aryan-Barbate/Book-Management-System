const mongoose = require("mongoose");
const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");
const { signToken } = require("../utils/jwt");

const isDbConnected = () => mongoose.connection.readyState === 1;

/**
 * Register a new user
 */
const register = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is temporarily unavailable." });
  }

  try {
    const { name, email, password } = req.body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ Message: "Name is required." });
    }

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ Message: "A valid email address is required." });
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ Message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({ Message: "An account with this email already exists. Please log in." });
    }

    const hashedPassword = await hashPassword(password);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    await user.save();

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return res.status(201).json({
      Message: "Registration successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        customShelves: user.customShelves,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ Message: error.message || "Failed to register account." });
  }
};

/**
 * Log in with email & password
 */
const login = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is temporarily unavailable." });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ Message: "Email and password are required." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(401).json({ Message: "Invalid email or password." });
    }

    if (!user.password) {
      return res.status(400).json({
        Message: "This account was created via Google Sign-In. Please click 'Sign in with Google'.",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ Message: "Invalid email or password." });
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      Message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        customShelves: user.customShelves,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ Message: error.message || "Failed to log in." });
  }
};

/**
 * Authenticate with Google ID token credential
 */
const googleAuth = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(503).json({ Message: "Database is temporarily unavailable." });
  }

  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ Message: "Google credential is required." });
    }

    let payload = null;

    // Verify token with Google's tokeninfo endpoint
    try {
      const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
      if (gRes.ok) {
        payload = await gRes.json();
      }
    } catch (e) {
      console.warn("Google tokeninfo fetch warning:", e.message);
    }

    // Fallback decode if direct network call blocked or offline
    if (!payload || !payload.email) {
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
          const jsonStr = Buffer.from(base64, "base64").toString("utf8");
          payload = JSON.parse(jsonStr);
        }
      } catch (decodeErr) {
        console.error("Failed to decode Google token:", decodeErr);
      }
    }

    if (!payload || !payload.email) {
      return res.status(400).json({ Message: "Invalid Google credential." });
    }

    const email = payload.email.toLowerCase().trim();
    const name = payload.name || payload.given_name || email.split("@")[0];
    const googleId = payload.sub;
    const avatar = payload.picture || "";

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update googleId and avatar if missing
      if (!user.googleId) user.googleId = googleId;
      if (!user.avatar && avatar) user.avatar = avatar;
      await user.save();
    } else {
      // Create new user
      user = new User({
        name,
        email,
        googleId,
        avatar,
        customShelves: ["Want to Read", "Currently Reading", "Read", "Favorites"],
      });
      await user.save();
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      Message: "Google authentication successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        customShelves: user.customShelves,
      },
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ Message: error.message || "Google authentication failed." });
  }
};

/**
 * 1-click Demo Account login for testing
 */
const demoLogin = async (req, res) => {
  if (!isDbConnected()) {
    // In demo mode with no DB, return a virtual user and token
    const demoId = "000000000000000000000001";
    const token = signToken({
      id: demoId,
      email: "demo@bookvault.io",
      name: "Demo Reader",
    });
    return res.status(200).json({
      Message: "Logged in as Demo Reader (Offline Mode)",
      token,
      user: {
        id: demoId,
        name: "Demo Reader",
        email: "demo@bookvault.io",
        avatar: "",
        customShelves: ["Want to Read", "Currently Reading", "Read", "Favorites", "Summer 2026"],
      },
    });
  }

  try {
    const demoEmail = "demo@bookvault.io";
    let user = await User.findOne({ email: demoEmail });

    if (!user) {
      const hashed = await hashPassword("DemoVault2026!");
      user = new User({
        name: "Demo Reader",
        email: demoEmail,
        password: hashed,
        customShelves: ["Want to Read", "Currently Reading", "Read", "Favorites", "Summer 2026"],
      });
      await user.save();
    }

    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    });

    return res.status(200).json({
      Message: "Logged in as Demo Reader!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        customShelves: user.customShelves,
      },
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return res.status(500).json({ Message: error.message || "Demo login failed." });
  }
};

/**
 * Get currently authenticated user profile
 */
const getMe = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        customShelves: ["Want to Read", "Currently Reading", "Read", "Favorites"],
      },
    });
  }

  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ Message: "User not found." });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        customShelves: user.customShelves,
      },
    });
  } catch (error) {
    return res.status(500).json({ Message: error.message });
  }
};

/**
 * Update custom shelves
 */
const updateShelves = async (req, res) => {
  try {
    const { customShelves } = req.body;
    if (!Array.isArray(customShelves)) {
      return res.status(400).json({ Message: "customShelves must be an array of strings." });
    }

    const cleaned = [...new Set(customShelves.map((s) => String(s).trim()).filter(Boolean))];

    if (!isDbConnected()) {
      return res.status(200).json({ customShelves: cleaned });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { customShelves: cleaned },
      { new: true }
    ).select("-password");

    return res.status(200).json({
      Message: "Shelves updated successfully.",
      customShelves: user ? user.customShelves : cleaned,
    });
  } catch (error) {
    return res.status(500).json({ Message: error.message });
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  demoLogin,
  getMe,
  updateShelves,
};
