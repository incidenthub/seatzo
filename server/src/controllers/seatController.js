import { lockMultipleSeats, releaseLock } from "../services/seatLockService.js";

export const lockSeats = async (req, res) => {
  const { eventId, seatIds } = req.body;
  const userId = req.user?.id || "testUser"; // temp fallback

  const result = await lockMultipleSeats(eventId, seatIds, userId);

  if (!result.success) {
    return res.status(409).json({
      error: `Seat ${result.failedSeat} already locked`
    });
  }

  res.json({ message: "Seats locked successfully" });
};