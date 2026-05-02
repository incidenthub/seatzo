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
    const attachments = [];
    let qrHtml = '';

    if (data.qrCode && data.qrCode.startsWith('data:')) {
      const qrBase64 = data.qrCode.split(',')[1];
      attachments.push({
        filename: 'ticket-qr.png',
        content: qrBase64,
        encoding: 'base64',
        cid: 'ticketqr'
      });
      qrHtml = `
        <div style="text-align: center; border: 2px dashed #e2e8f0; border-radius: 20px; padding: 32px; background-color: #ffffff;">
          <p style="margin: 0 0 20px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px;">Entry QR Code</p>
          <div style="background-color: #ffffff; padding: 12px; border: 1px solid #f1f5f9; border-radius: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);">
            <img src="cid:ticketqr" alt="QR Code" style="width: 180px; height: 180px; display: block; border-radius: 8px;" />
          </div>
          <p style="margin: 20px 0 0; font-size: 13px; font-weight: 600; color: #1e293b;">Scan at the venue entrance</p>
          <p style="margin: 4px 0 0; font-size: 12px; color: #94a3b8;">One scan per ticket. Do not share this code.</p>
        </div>
      `;
    } else {
      qrHtml = `
        <div style="text-align: center; padding: 20px;">
          <a href="${env.appUrl}/dashboard" style="display: inline-block; background-color: #f84464; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; box-shadow: 0 10px 15px -3px rgba(248,68,100,0.3);">View Your Digital Ticket</a>
        </div>
      `;
    }

    await transporter.sendMail({
      from: `"Seatzo" <${env.email.fromEmail}>`,
      to,
      subject: `Confirmed: ${data.eventTitle} 🎫`,
      attachments,
      html: `
      <div style="background-color: #f5f5f7; padding: 60px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02);">
          <!-- Header Card -->
          <div style="background: linear-gradient(135deg, #f84464 0%, #d63955 100%); padding: 50px 40px; text-align: center;">
            <div style="display: inline-block; background-color: rgba(255,255,255,0.2); color: #ffffff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; padding: 6px 16px; border-radius: 100px; margin-bottom: 20px;">Order Success</div>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; line-height: 1.1;">You're going to<br/>${data.eventTitle}!</h1>
          </div>

          <!-- Body Content -->
          <div style="padding: 40px;">
            <p style="margin: 0 0 24px; font-size: 17px; font-weight: 500; color: #1e293b;">Hi ${name},</p>
            <p style="margin: 0 0 32px; font-size: 15px; color: #64748b; line-height: 1.6;">Your tickets are confirmed! We've secured your spots for the show. Pack your excitement and we'll see you there.</p>

            <!-- Event Details Grid -->
            <div style="background-color: #f8fafc; border: 1px solid #f1f5f9; border-radius: 20px; padding: 30px; margin-bottom: 32px;">
              <div style="margin-bottom: 24px;">
                <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px;">Event & Venue</div>
                <div style="color: #1e293b; font-size: 18px; font-weight: 800;">${data.eventTitle}</div>
                <div style="color: #64748b; font-size: 14px; margin-top: 4px;">${data.venue}, ${data.city}</div>
              </div>
              
              <div style="display: flex; gap: 20px; margin-bottom: 24px;">
                <div style="flex: 1;">
                   <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Date</div>
                   <div style="color: #1e293b; font-size: 14px; font-weight: 700;">${dateStr}</div>
                </div>
                <div style="flex: 1;">
                   <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Time</div>
                   <div style="color: #1e293b; font-size: 14px; font-weight: 700;">${timeStr}</div>
                </div>
              </div>

              <div style="display: flex; gap: 20px; border-top: 1px solid #f1f5f9; padding-top: 24px;">
                <div style="flex: 1;">
                   <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Seats</div>
                   <div style="color: #1e293b; font-size: 14px; font-weight: 700;">${data.seats.join(", ")}</div>
                </div>
                <div style="flex: 1;">
                   <div style="color: #94a3b8; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 6px;">Reference</div>
                   <div style="color: #f84464; font-size: 14px; font-weight: 800; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">#${refId}</div>
                </div>
              </div>
            </div>

            <!-- Payment Summary -->
            <div style="text-align: center; margin-bottom: 40px; padding: 0 20px;">
              <div style="font-size: 13px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px;">Amount Paid</div>
              <div style="font-size: 36px; font-weight: 900; color: #1e293b; letter-spacing: -1px;">₹${(data.amount / 100).toLocaleString("en-IN")}</div>
            </div>

            <!-- QR Section -->
            ${qrHtml}
          </div>

          <!-- Bottom Branding -->
          <div style="background-color: #fafafa; padding: 40px; text-align: center; border-top: 1px solid #f5f5f7;">
            <p style="margin: 0 0 12px; font-size: 14px; font-weight: 500; color: #64748b;">Enjoy the show!</p>
            <div style="margin-bottom: 24px;">
               <span style="font-weight: 900; color: #d1d5db; letter-spacing: 2px;">SEATZO</span>
            </div>
            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">Questions? Contact us at <a href="mailto:support@seatzo.com" style="color: #f84464; text-decoration: none; font-weight: 600;">support@seatzo.com</a><br/>&copy; 2026 Seatzo Ticketing Services Pvt Ltd.</p>
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