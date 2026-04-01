import { lockSeat, lockMultipleSeats } from "./src/services/seatLockService.js";
import redis from "./src/config/redis.js";

const test = async () => {
  // Lock A1 first
  await lockSeat("event1", "A1", "user1");

  // Now try locking multiple
  const result = await lockMultipleSeats(
    "event1",
    ["A1", "A2", "A3"],
    "user2"
  );

  console.log(result);


const check = async () => {
  const valA2 = await redis.get("seat:event1:A2");
  const valA3 = await redis.get("seat:event1:A3");

  console.log("A2:", valA2);
  console.log("A3:", valA3);
};

await check();
};

test();