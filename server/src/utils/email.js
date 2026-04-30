import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';

const transporter = nodemailer.createTransport({
  host: env.email.smtpHost,
  port: env.email.smtpPort,
  auth: {
    user: env.email.smtpUser,
    pass: env.email.smtpPass,
  },
});

/**
 * Sends an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"${env.isProduction ? 'Seatzo' : 'Seatzo Dev'}" <${env.email.fromEmail}>`,
      to,
      subject,
      text,
      html,
    });

    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Error sending email:', error);
    throw error;
  }
};
