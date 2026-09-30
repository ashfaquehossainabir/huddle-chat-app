import User from '../models/User.js';
import Group from '../models/Group.js';

/**
 * Resolves a conversation for user `me`.
 *  - group: verifies membership; returns { g, filter, key }
 *  - dm:    looks up the other user by username; returns { other, filter, key }
 * `filter` matches that conversation's messages; `key` identifies it (used for typing state).
 */
export async function resolveConversation(me, type, id) {
  if (type === 'group') {
    const g = await Group.findOne({ _id: id, members: me });
    if (!g) throw new Error('Not a member of this group');
    return { g, filter: { group: g._id }, key: 'g' + g._id };
  }
  const other = await User.findOne({ username: (id || '').toLowerCase() });
  if (!other) throw new Error('User not found');
  return {
    other,
    filter: { group: null, $or: [{ sender: me, recipient: other._id }, { sender: other._id, recipient: me }] },
    key: 'd' + [String(me), String(other._id)].sort().join(''),
  };
}
