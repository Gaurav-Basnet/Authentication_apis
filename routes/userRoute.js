const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const allowedRoles = require("../middleware/role");
const {
  registerUser,
  verifyEmail,
  resendOtp,
} = require("../controllers/useController");
const { loginUser,refreshToken } = require("../controllers/loginController");
const {logoutUser} = require("../controllers/logoutController");
router.post("/register", registerUser);
router.post("/verify", verifyEmail);
router.post("/resend", resendOtp);
router.post("/refresh-t", refreshToken);

router.post("/login", loginUser);

router.get("/profile", authenticate, async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
});



router.post("/logout", authenticate, logoutUser);


module.exports = router;
