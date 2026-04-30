import { Router } from "express";
import { protect, requireRole } from "../middleware/auth.middleware.js";
import {
  createEvent,
  getEvents,
  getEvent,
  getMyEvents,
  updateEvent,
  publishEvent,
  cancelEvent,
  getAnalytics,
} from "../controllers/event.controller.js";

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get("/", getEvents);

// ─── Organiser / Admin Routes ─────────────────────────────────────────────────
// IMPORTANT: /my must be declared BEFORE /:id so Express doesn't match "my" as an id param
router.get("/my", protect, requireRole("organiser"), getMyEvents);

router.get("/:id", getEvent);

router.post("/", protect, requireRole("organiser", "admin"), createEvent);

router.put("/:id", protect, requireRole("organiser", "admin"), updateEvent);

router.patch(
  "/:id/publish",
  protect,
  requireRole("organiser", "admin"),
  publishEvent,
);

router.delete("/:id", protect, requireRole("organiser", "admin"), cancelEvent);

router.get(
  "/:id/analytics",
  protect,
  requireRole("organiser", "admin"),
  getAnalytics,
);

export default router;
