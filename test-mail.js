import "./config/env.js";
import nodemailer from "nodemailer";

console.log("USER     :", process.env.EMAIL_USER);
console.log("PASS LEN :", process.env.EMAIL_PASS?.length); // must be 16

const t = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

t.verify((err) => {
  if (err) {
    console.error("❌ VERIFY FAILED:", err.message, "| code:", err.code);
  } else {
    console.log("✅ SMTP READY — credentials work");
  }
});