import { env } from './config/env.js'; // must load first: validates required env vars
import { connectDb } from './config/db.js';
import app from './app.js';

await connectDb();
app.listen(env.port, '0.0.0.0', () => console.log('API on', env.port));
