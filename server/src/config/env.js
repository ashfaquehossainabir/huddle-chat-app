import 'dotenv/config';

const { MONGO_URI, JWT_SECRET, PORT, CLIENT_URL } = process.env;

if (!JWT_SECRET || !MONGO_URI) {
  console.error('Set MONGO_URI and JWT_SECRET');
  process.exit(1);
}

export const env = {
  mongoUri: MONGO_URI,
  jwtSecret: JWT_SECRET,
  port: PORT || 5000,
  // CLIENT_URL is a comma-separated allow-list, e.g. https://huddle.vercel.app,*.vercel.app
  clientOrigins: (CLIENT_URL || 'http://localhost:5173').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean),
};
