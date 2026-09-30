import cors from 'cors';
import { env } from './env.js';

const isAllowed = origin =>
  !origin || env.clientOrigins.some(a => a === origin || (a.startsWith('*.') && new URL(origin).hostname.endsWith(a.slice(1))));

export const corsMiddleware = cors({
  origin: (origin, cb) => (isAllowed(origin) ? cb(null, true) : cb(new Error('Origin not allowed by CORS'))),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
});
