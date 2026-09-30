import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import { MEMBER_FIELDS } from '../config/constants.js';
import { sameId } from '../utils/sameId.js';

export async function createGroup(req, res) {
  const names = (req.body.members || []).map(s => s.toLowerCase());
  const found = await User.find({ username: { $in: names } });
  const g = await Group.create({ name: req.body.name, owner: req.user._id, members: [req.user._id, ...found.map(u => u._id)] });
  res.json(await g.populate('members', MEMBER_FIELDS));
}

export async function addMember(req, res) {
  const g = await Group.findOne({ _id: req.params.id, members: req.user._id });
  const u = await User.findOne({ username: (req.body.username || '').toLowerCase() });
  if (!g) throw new Error('Group not found');
  if (!u) throw new Error('No user with that username');
  if (!g.members.some(m => sameId(m, u._id))) g.members.push(u._id);
  await g.save();
  res.json(await g.populate('members', MEMBER_FIELDS));
}

/** Leave a group. Ownership passes to the next member; an empty group is deleted with its messages. */
export async function leaveGroup(req, res) {
  const g = await Group.findOne({ _id: req.params.id, members: req.user._id });
  if (!g) throw new Error('Group not found');
  g.members = g.members.filter(m => !sameId(m, req.user._id));
  if (!g.members.length) { await Message.deleteMany({ group: g._id }); await g.deleteOne(); }
  else { if (sameId(g.owner, req.user._id)) g.owner = g.members[0]; await g.save(); }
  res.json({ ok: true });
}

/** Owner-only: remove another member. */
export async function removeMember(req, res) {
  const g = await Group.findOne({ _id: req.params.id, owner: req.user._id });
  if (!g) throw new Error('Only the group owner can remove members');
  const u = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!u || sameId(u._id, req.user._id)) throw new Error('Use Leave group to remove yourself');
  g.members = g.members.filter(m => !sameId(m, u._id));
  await g.save();
  res.json(await g.populate('members', MEMBER_FIELDS));
}
