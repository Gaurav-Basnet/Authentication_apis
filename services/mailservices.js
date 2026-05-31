const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const sendOtpEmail = async (email, otp) => {
  try {
    // 1. Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS);
    const html = await ejs.renderFile(
      path.join(__dirname, "../views/otpEmail.ejs"),
      { otp },
    );

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      html,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};


module.exports = { sendOtpEmail };
