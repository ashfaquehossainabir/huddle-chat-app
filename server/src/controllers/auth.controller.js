import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { BCRYPT_ROUNDS, MIN_PASSWORD_LENGTH } from '../config/constants.js';
import { EMAIL_RE, USERNAME_INPUT_RE } from '../utils/validators.js';
import { signToken } from '../utils/token.js';
import { self } from '../utils/serializers.js';

export async function signup(req, res) {
  const { name, username, password } = req.body;
  const email = (req.body.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) throw new Error('Enter a valid email address');
  if (!password || password.length < MIN_PASSWORD_LENGTH) throw new Error('Password must be at least 6 characters');
  if (!USERNAME_INPUT_RE.test(username || '')) throw new Error('Username: 3-20 letters, numbers or underscores');
  if (await User.exists({ username: username.toLowerCase() })) throw new Error('Username is already taken');
  if (await User.exists({ email })) throw new Error('Email is already registered');
  const user = await User.create({ name, username, email, password: await bcrypt.hash(password, BCRYPT_ROUNDS) });
  res.json({ token: signToken(user), user: self(user) });
}

export async function login(req, res) {
  const user = await User.findOne({ username: (req.body.username || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) throw new Error('Wrong username or password');
  res.json({ token: signToken(user), user: self(user) });
}
