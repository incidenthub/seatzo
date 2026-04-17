import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/event.model.js';
import User from '../models/user.model.js';
import { EVENT_STATUS, EVENT_CATEGORY } from '../utils/constants.js';

dotenv.config();

const events = [
  {
    title: 'Interstellar Symphony',
    description: 'A cinematic journey through space and time with a live orchestra performing Hans Zimmer’s legendary score.',
    venue: 'Royal Albert Hall',
    city: 'london',
    category: EVENT_CATEGORY.CONCERT,
    date: new Date('2026-05-15T19:00:00Z'),
    totalSeats: 500,
    availableSeats: 500,
    basePrice: 450000, // ₹4500
    status: EVENT_STATUS.PUBLISHED,
    posterUrl: 'https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=2000',
    tags: ['Orchestra', 'Space', 'Hans Zimmer']
  },
  {
    title: 'The Great Derby: City vs United',
    description: 'The ultimate showdown between the two biggest rivals in football history. Secure your seats for the most intense match of the season.',
    venue: 'Etihad Stadium',
    city: 'manchester',
    category: EVENT_CATEGORY.SPORTS,
    date: new Date('2026-06-20T15:00:00Z'),
    totalSeats: 2000,
    availableSeats: 2000,
    basePrice: 850000, // ₹8500
    status: EVENT_STATUS.PUBLISHED,
    posterUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2000',
    tags: ['Football', 'Derby', 'Premier League']
  },
  {
    title: 'Noir Echoes: Premiere',
    description: 'The world premiere of the highly anticipated psychological thriller. Followed by a Q&A session with the lead cast and director.',
    venue: 'Cine-Vault Deluxe',
    city: 'los angeles',
    category: EVENT_CATEGORY.MOVIE,
    date: new Date('2026-04-30T20:30:00Z'),
    totalSeats: 300,
    availableSeats: 300,
    basePrice: 250000, // ₹2500
    status: EVENT_STATUS.PUBLISHED,
    posterUrl: 'https://images.unsplash.com/photo-1485095329183-d0797cdc5676?auto=format&fit=crop&q=80&w=2000',
    tags: ['Thriller', 'Premiere', 'Cinema']
  },
  {
    title: 'Dave Chappelle Live',
    description: 'One night only. The king of comedy returns to the stage with all-new material for a strictly private session.',
    venue: 'The Apollo Theater',
    city: 'new york',
    category: EVENT_CATEGORY.STANDUP,
    date: new Date('2026-05-05T21:00:00Z'),
    totalSeats: 1200,
    availableSeats: 1200,
    basePrice: 1200000, // ₹12000
    status: EVENT_STATUS.PUBLISHED,
    posterUrl: 'https://images.unsplash.com/photo-1485872232697-a781ec33a73e?auto=format&fit=crop&q=80&w=2000',
    tags: ['Comedy', 'Exclusive', 'Standup']
  },
  {
    title: 'Echoes of the East',
    description: 'An experimental journey combining traditional Indian classical music with modern electronic synthesis.',
    venue: 'NCPA Mumbai',
    city: 'mumbai',
    category: EVENT_CATEGORY.CONCERT,
    date: new Date('2026-05-24T18:00:00Z'),
    totalSeats: 800,
    availableSeats: 800,
    basePrice: 350000, // ₹3500
    status: EVENT_STATUS.PUBLISHED,
    posterUrl: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?auto=format&fit=crop&q=80&w=2000',
    tags: ['Fusion', 'Classical', 'Electronic']
  }
];

const seedEvents = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // 1. Get or Create Organiser
    let organiser = await User.findOne({ role: 'organiser' });
    if (!organiser) {
      console.log('No organiser found, creating a default one...');
      organiser = await User.create({
        name: 'Default Organiser',
        email: 'organiser@seatzo.com',
        password: 'Password123!', // User model hashes this in pre-save
        role: 'organiser',
        isVerified: true
      });
    }
    console.log(`Using Organiser: ${organiser.name} (${organiser._id})`);

    // 2. Clear existing events (optional, maybe just append)
    // await Event.deleteMany({});
    // console.log('Cleared existing events');

    // 3. Insert new events
    const eventsWithOrganiser = events.map(event => ({
      ...event,
      organiser: organiser._id
    }));

    const result = await Event.insertMany(eventsWithOrganiser);
    console.log(`Successfully seeded ${result.length} events`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding events:', error);
    process.exit(1);
  }
};

seedEvents();
