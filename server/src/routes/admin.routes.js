import { Router } from 'express';
import { getAllUsers, updateUserRole, getAllEvents, getPlatformRevenue } from '../controllers/admin.controller.js';
import { protect} from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Only Admins can access these routes
router.use(protect);

router.get('/users', asyncHandler(getAllUsers));
router.patch('/users/:id/role', asyncHandler(updateUserRole));
router.get('/events', asyncHandler(getAllEvents));
router.get('/revenue', asyncHandler(getPlatformRevenue));

export default router;
