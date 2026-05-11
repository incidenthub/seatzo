import { Router } from 'express';
import {
  getAllUsers,
  updateUserRole,
  getAllEvents,
  getPlatformRevenue,
  getDashboardStats,
  getPendingOrganisers,
  verifyOrganiser,
} from '../controllers/admin.controller.js';
import { protect, requireRole } from '../middleware/auth.middleware.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

// Only Admins can access these routes
router.use(protect);
router.use(requireRole('admin'));

router.get('/stats', asyncHandler(getDashboardStats));
router.get('/users', asyncHandler(getAllUsers));
router.patch('/users/:id/role', asyncHandler(updateUserRole));
router.get('/events', asyncHandler(getAllEvents));
router.get('/revenue', asyncHandler(getPlatformRevenue));

router.get('/organisers/pending', asyncHandler(getPendingOrganisers));
router.patch('/organisers/:id/verify', asyncHandler(verifyOrganiser));

export default router;
