const express = require("express");
const router = express.Router();
const {registerUser,verifyEmail,resendOtp} = require("../controllers/useController");


router.post("/register", registerUser);
router.post("/verify", verifyEmail);
router.post("/resend",resendOtp);
module.exports = router;