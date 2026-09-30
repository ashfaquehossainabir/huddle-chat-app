import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { TOKEN_TTL } from '../config/constants.js';

export const signToken = u => jwt.sign({ id: u._id }, env.jwtSecret, { expiresIn: TOKEN_TTL });
export const verifyToken = raw => jwt.verify(raw, env.jwtSecret);
