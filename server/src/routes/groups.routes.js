import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createGroup, addMember, leaveGroup, removeMember } from '../controllers/group.controller.js';

const router = Router();
router.use(requireAuth);
router.post('/', asyncHandler(createGroup));
router.post('/:id/members', asyncHandler(addMember));
router.post('/:id/leave', asyncHandler(leaveGroup));
router.delete('/:id/members/:username', asyncHandler(removeMember));

export default router;
