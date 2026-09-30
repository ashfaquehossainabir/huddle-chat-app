import { useState, useEffect, useCallback } from 'react';
import { api } from '../api/client.js';

/**
 * Sidebar data (groups + direct chats, polled every 5s), the active tab and the open conversation.
 * `liveChat` is the active conversation merged with the freshest server data.
 */
export function useConversations(me) {
  const [tab, setTab] = useState('groups');
  const [data, setData] = useState({ groups: [], direct: [] });
  const [active, setActive] = useState(null);

  const refresh = useCallback(() => api('/chats').then(setData).catch(() => {}), []);
  useEffect(() => {
    if (!me) return;
    refresh();
    const t = setInterval(refresh, 5000);
    return () => clearInterval(t);
  }, [me, refresh]);

  const liveChat = active && (active.type === 'group'
    ? { type: 'group', group: (g => (g ? { ...g, id: g._id } : active.group))(data.groups.find(x => x._id === active.group.id)) }
    : { type: 'dm', user: data.direct.find(d => d.username === active.user.username) || active.user });

  const openGroup = g => { setActive({ type: 'group', group: { ...g, id: g._id } }); setTab('groups'); };
  const openDm = u => {
    setActive({ type: 'dm', user: u });
    setTab('direct');
    setData(d => (d.direct.some(x => x.username === u.username) ? d : { ...d, direct: [u, ...d.direct] }));
  };
  const closeChat = useCallback(() => setActive(null), []);
  const leaveChat = useCallback(() => { setActive(null); refresh(); }, [refresh]);
  const onGroupUpdate = g => { refresh(); if (g?.members) setActive(a => a && { ...a, group: { ...g, id: g._id } }); };

  return { tab, setTab, data, active, liveChat, refresh, openGroup, openDm, closeChat, leaveChat, onGroupUpdate };
}
