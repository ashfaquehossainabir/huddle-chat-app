/** Final error handler (e.g. CORS rejections). */
// eslint-disable-next-line no-unused-vars
export const errorHandler = (e, req, res, next) => res.status(403).json({ error: e.message });
