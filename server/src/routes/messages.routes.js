import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { listMessages, sendMessage, clearConversation, deleteMessage } from '../controllers/message.controller.js';

const router = Router();
router.use(requireAuth);
router.get('/', asyncHandler(listMessages));
router.post('/', asyncHandler(sendMessage));
router.delete('/', asyncHandler(clearConversation));
router.delete('/:id', asyncHandler(deleteMessage));

export default router;
