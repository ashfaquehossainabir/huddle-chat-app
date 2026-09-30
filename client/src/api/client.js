import { getToken, clearToken } from './session.js';

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

/** Tiny JSON fetch wrapper. Throws Error(message) on non-2xx; clears the token on 401. */
export const api = async (path, method = 'GET', body) => {
  const res = await fetch(BASE + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + getToken() },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) clearToken();
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};
