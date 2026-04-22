import { lockSeats, getSeats, releaseSeats } from "../controllers/seatController.js";
import { protect } from "../middleware/auth.middleware.js";
import { Router } from "express";

const router = Router();

// Current paths (standardizing to support both legacy and new routes)
router.post("/lock", protect, lockSeats);
router.delete("/lock", protect, releaseSeats); // Used by client/src/services/seat.service.js
router.post("/release", protect, releaseSeats); 
router.get("/:eventId", getSeats);

export default router;
