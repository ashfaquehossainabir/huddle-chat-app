import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const { Schema, model, Types } = mongoose;
const User = model('User', new Schema({
  name: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9_]{3,20}$/ },
  password: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
}, { timestamps: true }));
const Group = model('Group', new Schema({
  name: { type: String, required: true, trim: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));
const Message = model('Message', new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User' },
  group: { type: Schema.Types.ObjectId, ref: 'Group' },
  text: { type: String, required: true, maxlength: 2000 },
  readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true }));

const app = express();
if (!process.env.JWT_SECRET || !process.env.MONGO_URI) { console.error('Set MONGO_URI and JWT_SECRET'); process.exit(1); }
// CORS: CLIENT_URL is a comma-separated allow-list, e.g. https://huddle.vercel.app,*.vercel.app
const origins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',').map(x => x.trim().replace(/\/$/, '')).filter(Boolean);
const allowed = o => !o || origins.some(a => a === o || (a.startsWith('*.') && new URL(o).hostname.endsWith(a.slice(1))));
app.set('trust proxy', 1);
app.use(cors({
  origin: (o, cb) => allowed(o) ? cb(null, true) : cb(new Error('Origin not allowed by CORS')),
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
}));
app.use(express.json({ limit: '100kb' }));
app.get('/health', (req, res) => res.json({ ok: true }));
const wrap = fn => (req, res) => fn(req, res).catch(e => {
  if (e.code === 11000) {
    const field = Object.keys(e.keyPattern || e.keyValue || {})[0];
    console.error('Duplicate key error:', e.keyPattern || e.message);
    return res.status(409).json({ error: field === 'username' ? 'Username is already taken' : `Could not save: duplicate value for "${field || 'unknown'}" (check for a stale database index)` });
  }
  res.status(400).json({ error: e.message });
});
const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const pub = u => ({ id: u._id, name: u.name, username: u.username, lastActive: u.lastActive });

const auth = async (req, res, next) => {
  try {
    const { id } = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) throw new Error();
    req.user.lastActive = new Date();
    User.updateOne({ _id: id }, { lastActive: req.user.lastActive }).catch(() => {});
    next();
  } catch { res.status(401).json({ error: 'Please log in again' }); }
};

app.post('/api/auth/signup', wrap(async (req, res) => {
  const { name, username, password } = req.body;
  if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username || '')) throw new Error('Username: 3-20 letters, numbers or underscores');
  if (await User.exists({ username: username.toLowerCase() })) throw new Error('Username is already taken');
  const user = await User.create({ name, username, password: await bcrypt.hash(password, 10) });
  res.json({ token: sign(user), user: pub(user) });
}));

app.post('/api/auth/login', wrap(async (req, res) => {
  const user = await User.findOne({ username: (req.body.username || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) throw new Error('Wrong username or password');
  res.json({ token: sign(user), user: pub(user) });
}));

app.get('/api/me', auth, (req, res) => res.json(pub(req.user)));

app.get('/api/users/search', auth, wrap(async (req, res) => {
  const q = (req.query.q || '').toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!q) return res.json([]);
  const users = await User.find({ username: new RegExp('^' + q), _id: { $ne: req.user._id } }).limit(8);
  res.json(users.map(pub));
}));

// Sidebar data: joined groups + people I've messaged
app.get('/api/chats', auth, wrap(async (req, res) => {
  const me = req.user._id;
  const groups = await Group.find({ members: me }).sort({ updatedAt: -1 }).populate('members', 'name username lastActive');
  const dms = await Message.find({ group: null, $or: [{ sender: me }, { recipient: me }] }).sort({ createdAt: -1 }).limit(500);
  const ids = [...new Set(dms.map(m => String(m.sender) === String(me) ? String(m.recipient) : String(m.sender)))];
  const people = await User.find({ _id: { $in: ids } });
  const byId = Object.fromEntries(people.map(p => [String(p._id), p]));
  res.json({ groups, direct: ids.map(i => pub(byId[i])) });
}));

app.post('/api/groups', auth, wrap(async (req, res) => {
  const names = (req.body.members || []).map(s => s.toLowerCase());
  const found = await User.find({ username: { $in: names } });
  const g = await Group.create({ name: req.body.name, owner: req.user._id, members: [req.user._id, ...found.map(u => u._id)] });
  res.json(await g.populate('members', 'name username lastActive'));
}));

app.post('/api/groups/:id/members', auth, wrap(async (req, res) => {
  const g = await Group.findOne({ _id: req.params.id, members: req.user._id });
  const u = await User.findOne({ username: (req.body.username || '').toLowerCase() });
  if (!g) throw new Error('Group not found');
  if (!u) throw new Error('No user with that username');
  if (!g.members.some(m => String(m) === String(u._id))) g.members.push(u._id);
  await g.save();
  res.json(await g.populate('members', 'name username lastActive'));
}));

app.get('/api/messages', auth, wrap(async (req, res) => {
  const me = req.user._id, { type, id } = req.query;
  let filter;
  if (type === 'group') {
    if (!await Group.exists({ _id: id, members: me })) throw new Error('Not a member of this group');
    filter = { group: id };
  } else {
    const other = await User.findOne({ username: (id || '').toLowerCase() });
    if (!other) throw new Error('User not found');
    filter = { group: null, $or: [{ sender: me, recipient: other._id }, { sender: other._id, recipient: me }] };
  }
  await Message.updateMany({ ...filter, sender: { $ne: me }, readBy: { $ne: me } }, { $addToSet: { readBy: me } });
  const msgs = await Message.find(filter).sort({ createdAt: -1 }).limit(100).populate('sender', 'name username');
  res.json(msgs.reverse());
}));

app.post('/api/messages', auth, wrap(async (req, res) => {
  const { type, to, text } = req.body;
  if (!text?.trim()) throw new Error('Message is empty');
  const data = { sender: req.user._id, text: text.trim() };
  if (type === 'group') {
    if (!await Group.exists({ _id: to, members: req.user._id })) throw new Error('Not a member of this group');
    data.group = to;
    await Group.updateOne({ _id: to }, { updatedAt: new Date() });
  } else {
    const other = await User.findOne({ username: (to || '').toLowerCase() });
    if (!other) throw new Error('User not found');
    data.recipient = other._id;
  }
  res.json(await (await Message.create(data)).populate('sender', 'name username'));
}));

// ---- conversation helper, typing, deletes, leave/remove ----
const conv = async (me, type, id) => {
  if (type === 'group') {
    const g = await Group.findOne({ _id: id, members: me });
    if (!g) throw new Error('Not a member of this group');
    return { g, filter: { group: g._id }, key: 'g' + g._id };
  }
  const o = await User.findOne({ username: (id || '').toLowerCase() });
  if (!o) throw new Error('User not found');
  return { filter: { group: null, $or: [{ sender: me, recipient: o._id }, { sender: o._id, recipient: me }] }, key: 'd' + [String(me), String(o._id)].sort().join('') };
};
const typing = new Map(); // conversation key -> Map(userId -> { name, at })
app.post('/api/typing', auth, wrap(async (req, res) => {
  const { key } = await conv(req.user._id, req.body.type, req.body.to);
  if (!typing.has(key)) typing.set(key, new Map());
  typing.get(key).set(String(req.user._id), { name: req.user.name, at: Date.now() });
  res.json({ ok: true });
}));
app.get('/api/typing', auth, wrap(async (req, res) => {
  const { key } = await conv(req.user._id, req.query.type, req.query.id);
  const now = Date.now();
  res.json([...(typing.get(key) || [])].filter(([id, t]) => id !== String(req.user._id) && now - t.at < 4000).map(([, t]) => t.name));
}));

app.delete('/api/messages', auth, wrap(async (req, res) => {
  const { g, filter } = await conv(req.user._id, req.query.type, req.query.id);
  if (g && String(g.owner) !== String(req.user._id)) throw new Error('Only the group owner can delete all messages');
  res.json({ deleted: (await Message.deleteMany(filter)).deletedCount });
}));
app.delete('/api/messages/:id', auth, wrap(async (req, res) => {
  if (!(await Message.deleteOne({ _id: req.params.id, sender: req.user._id })).deletedCount) throw new Error('You can only delete your own messages');
  res.json({ ok: true });
}));

app.post('/api/groups/:id/leave', auth, wrap(async (req, res) => {
  const g = await Group.findOne({ _id: req.params.id, members: req.user._id });
  if (!g) throw new Error('Group not found');
  g.members = g.members.filter(m => String(m) !== String(req.user._id));
  if (!g.members.length) { await Message.deleteMany({ group: g._id }); await g.deleteOne(); }
  else { if (String(g.owner) === String(req.user._id)) g.owner = g.members[0]; await g.save(); }
  res.json({ ok: true });
}));
app.delete('/api/groups/:id/members/:username', auth, wrap(async (req, res) => {
  const g = await Group.findOne({ _id: req.params.id, owner: req.user._id });
  if (!g) throw new Error('Only the group owner can remove members');
  const u = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!u || String(u._id) === String(req.user._id)) throw new Error('Use Leave group to remove yourself');
  g.members = g.members.filter(m => String(m) !== String(u._id));
  await g.save();
  res.json(await g.populate('members', 'name username lastActive'));
}));

await mongoose.connect(process.env.MONGO_URI);
app.use((e, req, res, next) => res.status(403).json({ error: e.message }));
const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => console.log('API on', port));
