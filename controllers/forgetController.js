const User = require("../model/user");
const {sendOtpEmail}  = require("../services/mailservices");

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    user.verificationResetOTP = otp;

    user.verificationResetOTPExpires =
      Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendOtpEmail(
      user.email,
     
      otp
    );

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent",
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {forgotPassword};