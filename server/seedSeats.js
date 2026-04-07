import mongoose from "mongoose";
import dotenv from "dotenv";
import Seat from "./src/models/seat.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// 🔥 CHANGE THIS
const EVENT_ID = "69d0de61feb5e5771ce5e1b4";

const generateSeats = () => {
  const seats = [];

  const rows = ["A", "B", "C", "D", "E"];

  for (const row of rows) {
    for (let i = 1; i <= 10; i++) {
      seats.push({
        event: EVENT_ID,
        seatNumber: `${row}${i}`,
        row,
        section: "GENERAL", // adjust if needed
        status: "AVAILABLE",
        price: 100,
      });
    }
  }

  return seats;
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to DB");

    const seats = generateSeats();

    await Seat.insertMany(seats);

    console.log("✅ Seats created:", seats.length);

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();