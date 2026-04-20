import redis from "../config/redis.js";

export const calculatePrice = async (event, viewerCount=0) => {
  const cacheKey = `price:${event._id}`;

  // 🚀 1. Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  let multiplier = 1.0;

  

  // 📊 2. Availability (MOST IMPORTANT)
  const occupancy = event.totalSeats > 0
    ? 1 - (event.availableSeats / event.totalSeats)
    : 0;

  if (occupancy > 0.9) multiplier *= 2.0;
  else if (occupancy > 0.75) multiplier *= 1.5;
  else if (occupancy > 0.5) multiplier *= 1.2;

  // ⏱ 3. Time-based pricing
  const hoursLeft = (new Date(event.date) - Date.now()) / 3600000;

if (hoursLeft <= 0) {
  return {
    price: event.basePrice,
    multiplier: 1
  };
}

  if (hoursLeft < 6) multiplier *= 1.5;
  else if (hoursLeft < 24) multiplier *= 1.2;

  // 📈 4. Demand (viewer tracking)
  const viewerKey = `viewers:${event._id}`;
  const viewers = viewerCount;
  if (viewers > 100) multiplier *= 1.5;
  else if (viewers > 50) multiplier *= 1.2;

  // 🚫 5. Cap price (VERY IMPORTANT)
  multiplier = Math.min(multiplier, 3);

  const price = Math.round(event.basePrice * multiplier);

  const result = {
    price,
    multiplier,
    occupancy,
    viewers
  };

  // ⚡ 6. Cache result (performance)
  await redis.set(cacheKey, JSON.stringify(result), { EX: 30 });
console.log("CALCULATING PRICE...");
  return result;
};