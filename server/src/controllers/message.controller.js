import Group from '../models/Group.js';
import Message from '../models/Message.js';
import { MESSAGE_PAGE_SIZE, SENDER_FIELDS } from '../config/constants.js';
import { resolveConversation } from '../services/conversation.service.js';
import { sameId } from '../utils/sameId.js';

/** Latest messages of a conversation; marks the other people's messages as read by me. */
export async function listMessages(req, res) {
  const me = req.user._id, { type, id } = req.query;
  const { filter } = await resolveConversation(me, type, id);
  await Message.updateMany({ ...filter, sender: { $ne: me }, readBy: { $ne: me } }, { $addToSet: { readBy: me } });
  const msgs = await Message.find(filter).sort({ createdAt: -1 }).limit(MESSAGE_PAGE_SIZE).populate('sender', SENDER_FIELDS);
  res.json(msgs.reverse());
}

export async function sendMessage(req, res) {
  const { type, to, text } = req.body;
  if (!text?.trim()) throw new Error('Message is empty');
  const data = { sender: req.user._id, text: text.trim() };
  const { g, other } = await resolveConversation(req.user._id, type, to);
  if (g) {
    data.group = g._id;
    await Group.updateOne({ _id: g._id }, { updatedAt: new Date() });
  } else {
    data.recipient = other._id;
  }
  res.json(await (await Message.create(data)).populate('sender', SENDER_FIELDS));
}

/** Delete every message in a conversation (group: owner only). */
export async function clearConversation(req, res) {
  const { g, filter } = await resolveConversation(req.user._id, req.query.type, req.query.id);
  if (g && !sameId(g.owner, req.user._id)) throw new Error('Only the group owner can delete all messages');
  res.json({ deleted: (await Message.deleteMany(filter)).deletedCount });
}

/** Delete one of my own messages for everyone. */
export async function deleteMessage(req, res) {
  if (!(await Message.deleteOne({ _id: req.params.id, sender: req.user._id })).deletedCount) throw new Error('You can only delete your own messages');
  res.json({ ok: true });
}
