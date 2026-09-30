import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { setTyping, getTyping } from '../controllers/typing.controller.js';

const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(setTyping));
router.get('/', asyncHandler(getTyping));

export default router;
