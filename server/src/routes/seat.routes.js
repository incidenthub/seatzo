import { Router } from "express";
import { lockSeats, getSeats } from "../controllers/seatController.js";

const router = Router();

router.post("/lock", lockSeats);
router.get("/:eventId", getSeats);

export default router;