import nodemailer from 'nodemailer';

import env from './env.js';

const transporter = nodemailer.createTransport({
  host: env.email.smtpHost,
  port: env.email.smtpPort,
  secure: env.email.smtpPort === 465, // Use secure:true for port 465
  auth: {
    user: env.email.smtpUser,
    pass: env.email.smtpPass,
  },
});

transporter.verify((err) => {
  if (err) console.error('Mail server connection failed:', err.message);
  else console.log('Mail server ready');
});

// ─── OTP Email ───────────────────────────────────────────────────────────────

export const sendOTPEmail = async (to, name, otp) => {
  try {
    await transporter.sendMail({
      from: env.email.fromEmail,
      to,
      subject: "Verify your Seatzo account",
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Hi ${name},</h2>
        <p>Use the OTP below to verify your email. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                    text-align:center;padding:24px;background:#f4f4f5;
                    border-radius:8px;margin:24px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:13px">
          If you didn't create a Seatzo account, ignore this email.
        </p>
      </div>
    `,
    });
    console.log(`[Email] OTP sent to ${to}`);
  } catch (err) {
    console.error(`[Email] Failed to send OTP to ${to}:`, err.message);
    throw err;
  }
};

// ─── Password Reset Email ─────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (to, name, otp) => {
  try {
    await transporter.sendMail({
      from: env.email.fromEmail,
      to,
      subject: "Reset your Seatzo password",
      html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>Hi ${name},</h2>
        <p>Use the OTP below to reset your password. It expires in <strong>10 minutes</strong>.</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;
                    text-align:center;padding:24px;background:#f4f4f5;
                    border-radius:8px;margin:24px 0">
          ${otp}
        </div>
        <p style="color:#6b7280;font-size:13px">
          If you didn't request a password reset, ignore this email.
        </p>
      </div>
    `,
    });
    console.log(`[Email] Password reset sent to ${to}`);
  } catch (err) {
    console.error(`[Email] Failed to send password reset to ${to}:`, err.message);
    throw err;
  }
};

// ─── Booking Confirmation Email ───────────────────────────────────────────────

export const sendBookingConfirmation = async (to, name, data) => {
  const refId = data.id.toString().slice(-8).toUpperCase();
  const dateStr = new Date(data.eventDate).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = new Date(data.eventDate).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  try {
    await transporter.sendMail({
      from: env.email.fromEmail,
      to,
      subject: `Confirmed: ${data.eventTitle} 🎫`,
      html: `
      <div style="background-color: #f8fafc; padding: 40px 20px; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);">
          <!-- Header -->
          <div style="background-color: #7c3aed; padding: 40px 40px 30px; text-align: center;">
            <div style="color: #ffffff; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; opacity: 0.9;">Booking Confirmed</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">You're going to ${data.eventTitle}!</h1>
          </div>

          <!-- Body -->
          <div style="padding: 40px;">
            <p style="margin: 0 0 24px; font-size: 16px; color: #475569; line-height: 1.6;">Hi ${name},</p>
            <p style="margin: 0 0 32px; font-size: 16px; color: #475569; line-height: 1.6;">Your tickets are ready! We've confirmed your booking and secured your seats. Here are your event details:</p>

            <!-- Event Card -->
            <div style="background-color: #f1f5f9; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
              <h2 style="margin: 0 0 16px; font-size: 18px; font-weight: 700; color: #1e293b;">${data.eventTitle}</h2>
              <div style="display: flex; margin-bottom: 12px;">
                <div style="color: #64748b; font-size: 14px; width: 100px;">Date</div>
                <div style="color: #1e293b; font-size: 14px; font-weight: 600;">${dateStr}</div>
              </div>
              <div style="display: flex; margin-bottom: 12px;">
                <div style="color: #64748b; font-size: 14px; width: 100px;">Time</div>
                <div style="color: #1e293b; font-size: 14px; font-weight: 600;">${timeStr}</div>
              </div>
              <div style="display: flex; margin-bottom: 12px;">
                <div style="color: #64748b; font-size: 14px; width: 100px;">Venue</div>
                <div style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.venue}, ${data.city}</div>
              </div>
              <div style="display: flex; margin-bottom: 12px;">
                <div style="color: #64748b; font-size: 14px; width: 100px;">Seats</div>
                <div style="color: #1e293b; font-size: 14px; font-weight: 600;">${data.seats.join(", ")}</div>
              </div>
              <div style="display: flex; border-top: 1px solid #e2e8f0; margin-top: 16px; padding-top: 16px;">
                <div style="color: #64748b; font-size: 14px; width: 100px;">Ref ID</div>
                <div style="color: #7c3aed; font-size: 14px; font-weight: 700; font-family: monospace;">#${refId}</div>
              </div>
            </div>

            <!-- Total -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="font-size: 14px; color: #64748b; margin-bottom: 4px;">Total Paid</div>
              <div style="font-size: 32px; font-weight: 800; color: #1e293b;">₹${(data.amount / 100).toLocaleString("en-IN")}</div>
            </div>

            <!-- QR Code -->
            ${data.qrCode ? `
              <div style="text-align: center; border: 2px dashed #e2e8f0; border-radius: 12px; padding: 24px;">
                <p style="margin: 0 0 16px; font-size: 14px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Entry QR Code</p>
                <img src="${data.qrCode}" alt="QR Code" style="width: 180px; height: 180px; display: block; margin: 0 auto;" />
                <p style="margin: 16px 0 0; font-size: 12px; color: #94a3b8;">Show this code at the gate for entry</p>
              </div>
            ` : `
              <div style="text-align: center;">
                <a href="${env.appUrl}/dashboard" style="display: inline-block; background-color: #7c3aed; color: #ffffff; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">View Your Tickets</a>
              </div>
            `}
          </div>

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 30px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="margin: 0 0 8px; font-size: 14px; color: #64748b;">Questions? Contact us at support@seatzo.com</p>
            <p style="margin: 0; font-size: 12px; color: #94a3b8;">&copy; 2026 Seatzo Ticketing Services Pvt Ltd. All rights reserved.</p>
          </div>
        </div>
      </div>
    `,
    });
    console.log(`[Email] Confirmation sent to ${to} for Booking #${refId}`);
  } catch (err) {
    console.error(`[Email] Failed to send confirmation to ${to}:`, err.message);
    throw err;
  }
};