import { Router } from "express";
import { lockSeats, getSeats, releaseSeats } from "../controllers/seatController.js";

const router = Router();

router.post("/lock", lockSeats);
router.get("/:eventId", getSeats);
router.post("/release", releaseSeats)

export default router;
