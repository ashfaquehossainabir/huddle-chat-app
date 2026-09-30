import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listChats } from '../controllers/chat.controller.js';

const router = Router();
router.get('/', requireAuth, asyncHandler(listChats));

export default router;
