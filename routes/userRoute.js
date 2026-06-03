const express = require("express");
const router = express.Router();
const authenticate = require("../middleware/auth");
const allowedRoles = require("../middleware/role");
const { getProfile } = require("../controllers/profileController");

const {
  registerUser,
  verifyEmail,
  resendOtp,
} = require("../controllers/useController");


const { loginUser, refreshToken } = require("../controllers/loginController");
const { logoutUser } = require("../controllers/logoutController");



router.post("/register", registerUser);
router.post("/verify", verifyEmail);
router.post("/resend", resendOtp);
router.post("/refresh-t", refreshToken);

router.post("/login", loginUser);

router.get("/profile", authenticate, getProfile);

router.post("/logout", authenticate, logoutUser);

module.exports = router;
