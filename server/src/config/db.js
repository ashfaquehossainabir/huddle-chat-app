import mongoose from 'mongoose';
import { env } from './env.js';
import User from '../models/User.js';

export async function connectDb() {
  await mongoose.connect(env.mongoUri);
  // Drop indexes left over from older schema versions (e.g. a unique "email_1" index) and build the current ones.
  try { await User.syncIndexes(); } catch (e) { console.error('User index sync failed:', e.message); }
}
