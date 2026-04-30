import mongoose from 'mongoose';
import env from './src/config/env.js';
import Event from './src/models/event.model.js';

async function checkEvent() {
  await mongoose.connect(env.mongoUri);
  const event = await Event.findOne({ title: /SUMMER MUSIC FEST/i });
  console.log('Event found:', JSON.stringify(event, null, 2));
  await mongoose.disconnect();
}

checkEvent();
