const User = require("../model/User");
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require("../services/mailservices");
const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, username, email, phoneNumber, password } =
      req.body;

    // 1. Validate required fields
    if (
      !firstName ||
      !lastName ||
      !username ||
      !email ||
      !phoneNumber ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 2. Check duplicates
    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(409).json({ message: "Email already exists" });

    const usernameExists = await User.findOne({
      username,
    });
    if (usernameExists)
      return res.status(409).json({ message: "Username already exists" });

    const phoneExists = await User.findOne({
      phoneNumber,
    });
    if (phoneExists)
      return res.status(409).json({ message: "Phone already exists" });

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await sendOtpEmail(email, otp);
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

    // 5. Create user
    const user = await User.create({
      firstName,
      lastName,
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      verificationOTP: otp,
      verificationOTPExpires: otpExpires,
      lastOtpSentAt: new Date(),
    });

    // 6. Response
    return res.status(201).json({
      success: true,
      message: "User registered. Please verify OTP sent to email.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // check OTP expiry
    if (user.verificationOTPExpires < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // check OTP match
    if (user.verificationOTP !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // activate user
    user.emailVerified = true;
    user.status = "active";

    // clear OTP
    user.verificationOTP = undefined;
    user.verificationOTPExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }
    if (user.lastOtpSentAt && Date.now() - user.lastOtpSentAt < 60 * 1000) {
      return res.status(429).json({
        success: false,
        message: "Please wait 60 seconds before requesting again",
      });
    }
    // generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.verificationOTP = otp;
    user.verificationOTPExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // send email
    await sendOtpEmail(email, otp);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = { registerUser, verifyEmail, resendOtp };
