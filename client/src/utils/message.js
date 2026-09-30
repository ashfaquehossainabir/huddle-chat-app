/** Message helpers. */
export const senderId = m => m.sender._id || m.sender.id;

/** Two messages belong to the same visual "run" when sent by one person within 5 minutes. */
export const GROUP_WINDOW_MS = 300000;

export const receiptFor = (m, meId, isGroup) => {
  const n = (m.readBy || []).filter(id => id !== meId).length;
  return n ? { seen: true, label: isGroup ? `Seen by ${n}` : 'Seen' } : { seen: false, label: 'Sent' };
};
