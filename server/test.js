import { lockSeat, releaseLock } from "./src/services/seatLockService.js";

const test = async () => {
  const eventId = "event1";
  const seatId = "seat1";

  console.log("Locking seat...");
  const firstLock = await lockSeat(eventId, seatId, "user1");
  console.log("First lock:", firstLock); // should be true

  console.log("Trying second lock...");
  const secondLock = await lockSeat(eventId, seatId, "user2");
  console.log("Second lock:", secondLock); // should be false

  console.log("Releasing lock...");
  await releaseLock(eventId, seatId);

  console.log("Trying again after release...");
  const thirdLock = await lockSeat(eventId, seatId, "user3");
  console.log("Third lock:", thirdLock); // should be true
};

test();