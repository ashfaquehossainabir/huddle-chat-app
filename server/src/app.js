import express from 'express';
import { corsMiddleware } from './config/cors.js';
import apiRoutes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.set('trust proxy', 1);
app.use(corsMiddleware);
app.use(express.json({ limit: '100kb' }));
app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api', apiRoutes);
app.use(errorHandler);

export default app;
