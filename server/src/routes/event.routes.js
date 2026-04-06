import { Router } from 'express';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import {
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  publishEvent,
  cancelEvent,
  getAnalytics,
} from '../controllers/event.controller.js';

const router = Router();

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/',    getEvents);
router.get('/:id', getEvent);

// ─── Organiser / Admin Routes ─────────────────────────────────────────────────
router.post('/',
  protect, requireRole('organiser', 'admin'),
  createEvent
);

router.put('/:id',
  protect, requireRole('organiser', 'admin'),
  updateEvent
);

router.patch('/:id/publish',
  protect, requireRole('organiser', 'admin'),
  publishEvent
);

router.delete('/:id',
  protect, requireRole('organiser', 'admin'),
  cancelEvent
);

router.get('/:id/analytics',
  protect, requireRole('organiser', 'admin'),
  getAnalytics
);

export default router;