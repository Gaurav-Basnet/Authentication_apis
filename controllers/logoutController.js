const User = require("../model/user");

const logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    refreshToken.trim();

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token required",
      });
    }

    const user = await User.findOne({
      "refreshTokens.token": refreshToken,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Session not found",
      });
    }

    user.refreshTokens = user.refreshTokens.filter(
      (t) => t.token !== refreshToken,
    );

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = { logoutUser };
