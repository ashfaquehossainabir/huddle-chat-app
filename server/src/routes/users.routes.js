import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { searchUsers } from '../controllers/user.controller.js';

const router = Router();
router.get('/search', requireAuth, asyncHandler(searchUsers));

export default router;
