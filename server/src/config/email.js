import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((err) => {
  if (err) console.error('Mail server connection failed:', err.message);
  else console.log('Mail server ready');
});

// ─── OTP Email ───────────────────────────────────────────────────────────────

export const sendOTPEmail = async (to, name, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your Seatzo account',
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
};

// ─── Password Reset Email ─────────────────────────────────────────────────────

export const sendPasswordResetEmail = async (to, name, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Reset your Seatzo password',
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
};

// ─── Booking Confirmation Email ───────────────────────────────────────────────

export const sendBookingConfirmation = async (to, name, booking) => {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: `Booking confirmed — ${booking.eventTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:auto">
        <h2>You're going, ${name}! 🎉</h2>
        <p>Your booking for <strong>${booking.eventTitle}</strong> is confirmed.</p>
        <ul>
          <li>Booking ID: <strong>${booking.id}</strong></li>
          <li>Seats: <strong>${booking.seats.join(', ')}</strong></li>
          <li>Amount paid: <strong>₹${booking.amount / 100}</strong></li>
        </ul>
        ${booking.qrCode
        ? `<p>Your entry QR code:</p>
             <img src="${booking.qrCode}" alt="QR Code" style="width:200px" />`
        : ''}
        <p style="color:#6b7280;font-size:13px">Show this email at the venue.</p>
      </div>
    `,
  });
};