import { lockSeats, getSeats, releaseSeats, releaseAllLocks, renewSeatLocks } from '../controllers/seatController.js';
import { protect } from '../middleware/auth.middleware.js';
import { Router } from 'express';

const router = Router();

router.post('/lock', protect, lockSeats);
router.post('/renew', protect, renewSeatLocks);
router.delete('/lock', protect, releaseSeats);
router.post('/release', protect, releaseSeats);
router.post('/release-all', protect, releaseAllLocks);
router.get('/:eventId', getSeats);

export default router;