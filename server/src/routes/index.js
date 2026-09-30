import { Router } from 'express';
import authRoutes from './auth.routes.js';
import meRoutes from './me.routes.js';
import usersRoutes from './users.routes.js';
import chatsRoutes from './chats.routes.js';
import groupsRoutes from './groups.routes.js';
import messagesRoutes from './messages.routes.js';
import typingRoutes from './typing.routes.js';

/** All API routes, mounted under /api by app.js. */
const router = Router();
router.use('/auth', authRoutes);
router.use('/me', meRoutes);
router.use('/users', usersRoutes);
router.use('/chats', chatsRoutes);
router.use('/groups', groupsRoutes);
router.use('/messages', messagesRoutes);
router.use('/typing', typingRoutes);

export default router;
