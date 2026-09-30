/** Public view of a user (safe to show to anyone). */
export const pub = u => ({ id: u._id, name: u.name, username: u.username, lastActive: u.lastActive });

/** The user's own view: email is only ever returned to its owner. */
export const self = u => ({ ...pub(u), email: u.email || '' });
