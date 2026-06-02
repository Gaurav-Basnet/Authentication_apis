const User = require("../model/user");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
require("dotenv").config();

const jwt = require("jsonwebtoken");

const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const loginUser = async (req, res) => {
  try {
    const { login, password } = req.body;

    // Validate input
    if (!login || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide login phone number and password",
      });
    }

    // Find user by email or phone number
    const user = await User.findOne({
      $or: [{ email: login }, { phoneNumber: login }, { username: login }],
    });

    // User not found
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // Check if account is temporarily locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      return res.status(403).json({
        success: false,
        message: "Account temporarily locked. Try again later.",
      });
    }

    // Check account status
    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Account is blocked",
      });
    }

    // Email verification check
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    // Wrong password
    if (!isMatch) {
      user.loginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.loginAttempts >= 5) {
        user.lockUntil = new Date(
          Date.now() + 30 * 60 * 1000, // 30 minutes
        );
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid login credentials",
      });
    }

    // Successful login
    user.loginAttempts = 0;
    user.lockUntil = null;
    user.lastLogin = new Date();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    user.refreshTokens.push({
      token: refreshToken,
    });

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    refreshToken.trim();

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Refresh token required",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tokenExists = user.refreshTokens.find(
      (t) => t.token === refreshToken,
    );

    if (!tokenExists) {
      return res.status(403).json({
        success: false,
        message: "Refresh token not valid (logged out or reused)",
      });
    }

    const accessToken = generateAccessToken(user);

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { loginUser, refreshToken };
