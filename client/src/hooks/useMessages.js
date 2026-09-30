import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../api/client.js';

/** Loads a conversation's messages and polls every 3s. Calls onLeave if the user was removed from the group. */
export function useMessages(type, key, onLeave) {
  const [msgs, setMsgs] = useState([]);
  const [err, setErr] = useState('');
  const leave = useRef(onLeave);
  leave.current = onLeave;

  const load = useCallback(
    () => api(`/messages?type=${type}&id=${key}`).then(setMsgs).catch(e => (/Not a member/.test(e.message) ? leave.current() : setErr(e.message))),
    [type, key],
  );
  useEffect(() => {
    setMsgs([]); setErr(''); load();
    const t = setInterval(load, 3000);
    return () => clearInterval(t);
  }, [load]);

  return { msgs, setMsgs, err, setErr };
}
