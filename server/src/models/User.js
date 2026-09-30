import mongoose from 'mongoose';
import { EMAIL_RE } from '../utils/validators.js';

const { Schema, model } = mongoose;

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_]{3,20}$/ },
  email: { type: String, lowercase: true, trim: true, match: [EMAIL_RE, 'Enter a valid email address'] },
  password: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true });

// Unique only when an email exists, so accounts created before emails were added don't clash on null.
userSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { email: { $type: 'string' } } });

export default model('User', userSchema);
