import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name:    { type: String, required: true },
  email:   { type: String, required: true },
  subject: { type: String, default: 'No Subject' },
  message: { type: String, required: true },
  replied: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Contact', contactSchema);