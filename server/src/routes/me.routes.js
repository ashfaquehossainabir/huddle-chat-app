import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { getMe, updateMe, changePassword } from '../controllers/user.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', getMe);
router.patch('/', asyncHandler(updateMe));
router.put('/password', asyncHandler(changePassword));

export default router;
