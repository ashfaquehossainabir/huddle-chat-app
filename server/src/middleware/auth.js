import User from '../models/User.js';
import { verifyToken } from '../utils/token.js';

/** Requires a valid Bearer token; sets req.user and refreshes their lastActive. */
export const requireAuth = async (req, res, next) => {
  try {
    const { id } = verifyToken((req.headers.authorization || '').replace('Bearer ', ''));
    req.user = await User.findById(id);
    if (!req.user) throw new Error();
    req.user.lastActive = new Date();
    User.updateOne({ _id: id }, { lastActive: req.user.lastActive }).catch(() => {});
    next();
  } catch { res.status(401).json({ error: 'Please log in again' }); }
};
