import Contact from '../models/contact.model.js';
import { sendContactEmail } from '../config/email.js';

export const submitContact = async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    throw Object.assign(new Error('Name, email and message are required'), { statusCode: 400 });
  }

  const contact = await Contact.create({ name, email, subject, message });

  try {
    await sendContactEmail({ name, email, subject, message });
  } catch (err) {
    console.error('[Contact] Failed to send email:', err?.message);
  }

  res.status(201).json({ success: true, message: 'Message received. We\'ll get back to you soon.' });
};