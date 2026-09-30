import { resolveConversation } from '../services/conversation.service.js';
import { markTyping, whoIsTyping } from '../services/typing.service.js';

export async function setTyping(req, res) {
  const { key } = await resolveConversation(req.user._id, req.body.type, req.body.to);
  markTyping(key, req.user);
  res.json({ ok: true });
}

export async function getTyping(req, res) {
  const { key } = await resolveConversation(req.user._id, req.query.type, req.query.id);
  res.json(whoIsTyping(key, req.user._id));
}
