import { Router } from "express";
import { lockSeats, getSeats, releaseSeats } from "../controllers/seatController.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/lock", protect, lockSeats);
router.post("/release", protect, releaseSeats);
router.get("/:eventId", getSeats);

export default router;