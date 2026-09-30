import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { signup, login } from '../controllers/auth.controller.js';

const router = Router();
router.post('/signup', asyncHandler(signup));
router.post('/login', asyncHandler(login));

export default router;
