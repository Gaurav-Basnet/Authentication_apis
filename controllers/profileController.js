const User = require("../model/user");

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -verificationOTP -verificationOTPExpires -passwordResetOTP -passwordResetOTPExpires -refreshTokens -_id -emailverified -createdAt -updatedAt -loginAttempts -lockUntil -lastOtpSentAt",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getProfile,
};
