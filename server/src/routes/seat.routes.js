import { Router } from "express";
import { lockSeats, releaseSeats } from "../controllers/seatController.js";

const router = Router();

router.post("/lock", lockSeats);
router.delete("/lock", releaseSeats);

export default router;
