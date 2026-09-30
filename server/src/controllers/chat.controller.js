import User from '../models/User.js';
import Group from '../models/Group.js';
import Message from '../models/Message.js';
import { DM_SCAN_LIMIT, MEMBER_FIELDS } from '../config/constants.js';
import { pub } from '../utils/serializers.js';
import { sameId } from '../utils/sameId.js';

/** Sidebar data: joined groups + people I've messaged. */
export async function listChats(req, res) {
  const me = req.user._id;
  const groups = await Group.find({ members: me }).sort({ updatedAt: -1 }).populate('members', MEMBER_FIELDS);
  const dms = await Message.find({ group: null, $or: [{ sender: me }, { recipient: me }] }).sort({ createdAt: -1 }).limit(DM_SCAN_LIMIT);
  const ids = [...new Set(dms.map(m => (sameId(m.sender, me) ? String(m.recipient) : String(m.sender))))];
  const people = await User.find({ _id: { $in: ids } });
  const byId = Object.fromEntries(people.map(p => [String(p._id), p]));
  res.json({ groups, direct: ids.map(i => pub(byId[i])) });
}
