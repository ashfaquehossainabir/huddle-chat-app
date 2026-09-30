import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { BCRYPT_ROUNDS, MIN_PASSWORD_LENGTH, USER_SEARCH_LIMIT } from '../config/constants.js';
import { EMAIL_RE } from '../utils/validators.js';
import { pub, self } from '../utils/serializers.js';

export const getMe = (req, res) => res.json(self(req.user));

/** Account settings: update name / email. */
export async function updateMe(req, res) {
  const name = (req.body.name || '').trim();
  const email = (req.body.email || '').trim().toLowerCase();
  if (!name) throw new Error('Name is required');
  if (!EMAIL_RE.test(email)) throw new Error('Enter a valid email address');
  if (email !== req.user.email && await User.exists({ email, _id: { $ne: req.user._id } })) throw new Error('Email is already registered');
  req.user.name = name;
  req.user.email = email;
  await req.user.save();
  res.json(self(req.user));
}

/** Account settings: change password (requires the current one). */
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!(await bcrypt.compare(currentPassword || '', req.user.password))) throw new Error('Current password is incorrect');
  if (!newPassword || newPassword.length < MIN_PASSWORD_LENGTH) throw new Error('New password must be at least 6 characters');
  req.user.password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await req.user.save();
  res.json({ ok: true });
}

/** Username prefix search (excludes the caller). */
export async function searchUsers(req, res) {
  const q = (req.query.q || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!q) return res.json([]);
  const users = await User.find({ username: new RegExp('^' + q), _id: { $ne: req.user._id } }).limit(USER_SEARCH_LIMIT);
  res.json(users.map(pub));
}
