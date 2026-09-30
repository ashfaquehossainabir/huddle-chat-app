import { TYPING_TTL_MS } from '../config/constants.js';

// conversation key -> Map(userId -> { name, at }). In-memory: resets on restart, single instance only.
const typing = new Map();

export function markTyping(key, user) {
  if (!typing.has(key)) typing.set(key, new Map());
  typing.get(key).set(String(user._id), { name: user.name, at: Date.now() });
}

/** Names of everyone (except `meId`) who pinged recently in this conversation. */
export function whoIsTyping(key, meId) {
  const now = Date.now();
  return [...(typing.get(key) || [])]
    .filter(([id, t]) => id !== String(meId) && now - t.at < TYPING_TTL_MS)
    .map(([, t]) => t.name);
}
