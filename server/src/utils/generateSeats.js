import Seat from '../models/seat.model.js';

// ─── generateSeats ─────────────────────────────────────────────────────────
// Bulk-inserts all Seat documents for a newly created event.
// Called once inside createEvent — never again after that.
//
// sections shape (sent in POST /api/events body):
// [
//   { name: 'PREMIUM', rows: ['A', 'B'],          seatsPerRow: 20, price: 50000 },
//   { name: 'GOLD',    rows: ['C', 'D', 'E'],      seatsPerRow: 30, price: 30000 },
//   { name: 'SILVER',  rows: ['F', 'G'],            seatsPerRow: 40, price: 20000 },
//   { name: 'GENERAL', rows: ['H', 'I', 'J', 'K'], seatsPerRow: 50, price: 10000 },
// ]
//
// Returns: total number of seats inserted (used to set totalSeats on Event)

const generateSeats = async (eventId, sections) => {
  const seats = [];

  for (const section of sections) {
    for (const row of section.rows) {
      for (let num = 1; num <= section.seatsPerRow; num++) {
        seats.push({
          event:      eventId,
          seatNumber: `${row}${num}`,    // A1, A2 … B1, B2
          row,
          section:    section.name,
          status:     'AVAILABLE',
          price:      section.price,
        });
      }
    }
  }

  // Single DB round-trip — fast even for 500+ seat venues
  // ordered: false means a single duplicate won't abort the whole batch
  await Seat.insertMany(seats, { ordered: false });

  return seats.length;
};

export default generateSeats;