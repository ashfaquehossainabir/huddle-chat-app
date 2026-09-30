import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';
import { getToken, clearToken } from '../api/session.js';

/** Current user + boot state. `ready` flips true once the stored token has been checked. */
export function useAuth() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!getToken()) return setReady(true);
    api('/me').then(setMe).catch(() => {}).finally(() => setReady(true));
  }, []);
  const logout = useCallback(() => { clearToken(); setMe(null); }, []);
  return { me, setMe, ready, logout };
}
