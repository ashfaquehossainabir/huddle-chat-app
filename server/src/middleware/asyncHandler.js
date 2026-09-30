/**
 * Wraps an async route handler: duplicate-key errors become 409, any other error a 400
 * with the error message.
 */
export const asyncHandler = fn => (req, res) => fn(req, res).catch(e => {
  if (e.code === 11000) {
    const field = Object.keys(e.keyPattern || e.keyValue || {})[0];
    console.error('Duplicate key error:', e.keyPattern || e.message);
    return res.status(409).json({
      error: field === 'username' ? 'Username is already taken'
        : field === 'email' ? 'Email is already registered'
        : `Could not save: duplicate value for "${field || 'unknown'}" (check for a stale database index)`,
    });
  }
  res.status(400).json({ error: e.message });
});
