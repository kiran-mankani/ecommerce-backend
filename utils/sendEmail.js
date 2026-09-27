// backend/utils/sendEmail.js
import nodemailer from "nodemailer";
import ApiError from "./ApiError.js";

// ============================================================
// Lazy transporter — created fresh each time we send
// This guarantees process.env is fully loaded by then
// ============================================================
const createTransporter = () => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new ApiError(
      500,
      "Email service not configured (EMAIL_USER or EMAIL_PASS missing)"
    );
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Optional connection check — call this once at startup if you want
const verifyEmailConfig = async () => {
  try {
    await createTransporter().verify();
    console.log("✅ Gmail email service connected");
  } catch (err) {
    console.error("❌ Gmail configuration error:", err.message);
    throw new ApiError(500, "Email service configuration failed");
  }
};

// ============================================================
// Generic send email
// ============================================================
const sendEmail = async ({ to, subject, html }) => {
  const from = `${process.env.EMAIL_FROM_NAME || "Ecommerce"} <${process.env.EMAIL_USER}>`;

  console.log("📤 Sending email via Gmail →", { from, to, subject });

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({ from, to, subject, html });
    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Gmail email error:", err.message);
    throw new ApiError(500, err.message || "Failed to send email. Please try again.");
  }
};

/* ============================================================
   Email templates
   ============================================================ */

const baseTemplate = (title, bodyHtml) => `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${title}</title>
    </head>

    <body style="margin:0;padding:0;background:#f8fafc;font-family:Inter,Arial,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
        style="background:#f8fafc;padding:32px 16px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
              style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.06);">

              <tr>
                <td style="background:linear-gradient(135deg,#1e3fae 0%,#2b5bd6 100%);padding:28px 32px;text-align:left;">
                  <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                    ecommerce
                  </span>
                </td>
              </tr>

              <tr>
                <td style="padding:32px;">
                  ${bodyHtml}
                </td>
              </tr>

              <tr>
                <td style="padding:20px 32px;background:#f8fafc;border-top:1px solid #e2e8f0;font-size:12px;color:#64748b;text-align:center;">
                  If you didn't request this email, you can safely ignore it.
                  <br />
                  © ${new Date().getFullYear()} Ecommerce. All rights reserved.
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
`;

const otpBox = (otp) => `
  <div style="text-align:center;margin:24px 0;">
    <div style="display:inline-block;background:#f1f5f9;border:1px dashed #cbd5e1;border-radius:12px;padding:16px 28px;font-size:32px;font-weight:700;letter-spacing:8px;color:#0f172a;">
      ${otp}
    </div>
  </div>
`;

// ============================================================
// Signup verification OTP
// ============================================================
export const sendVerificationOtpEmail = async (to, otp) => {
  const html = baseTemplate(
    "Verify your email",
    `
      <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;">
        Verify your email
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#475569;line-height:1.5;">
        Thanks for signing up! Please use the OTP below to verify your email address.
      </p>
      ${otpBox(otp)}
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;">
        This OTP is valid for <strong>10 minutes</strong>.
      </p>
    `
  );

  return sendEmail({
    to,
    subject: "Verify your email — Ecommerce",
    html,
  });
};

// ============================================================
// Reset password OTP
// ============================================================
export const sendResetPasswordOtpEmail = async (to, otp) => {
  const html = baseTemplate(
    "Reset your password",
    `
      <h2 style="margin:0 0 8px;font-size:22px;color:#0f172a;">
        Reset your password
      </h2>
      <p style="margin:0 0 4px;font-size:14px;color:#475569;line-height:1.5;">
        We received a request to reset your password. Use the OTP below to continue.
      </p>
      ${otpBox(otp)}
      <p style="margin:0;font-size:13px;color:#64748b;text-align:center;">
        This OTP is valid for <strong>10 minutes</strong>.
        If you didn't request this, please ignore this email.
      </p>
    `
  );

  return sendEmail({
    to,
    subject: "Reset your password — Ecommerce",
    html,
  });
};

export { verifyEmailConfig };
export default sendEmail;