import { Router } from "express";
import { lockSeats, getSeats, releaseSeats } from "../controllers/seatController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/lock", protect, lockSeats);
router.get("/:eventId", getSeats);
router.delete("/lock", protect, releaseSeats);

export default router;
