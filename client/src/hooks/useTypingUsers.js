import { useState, useEffect } from 'react';
import { api } from '../api/client.js';

/** Names of the other people currently typing in this conversation (polled every 1.5s). */
export function useTypingUsers(type, key) {
  const [typers, setTypers] = useState([]);
  useEffect(() => {
    setTypers([]);
    const t = setInterval(() => api(`/typing?type=${type}&id=${key}`).then(setTypers).catch(() => {}), 1500);
    return () => clearInterval(t);
  }, [type, key]);
  return typers;
}
