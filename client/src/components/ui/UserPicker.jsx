import { useState, useEffect } from 'react';
import { api } from '../../api/client.js';
import { activeText, isOnline } from '../../utils/format.js';
import Icon from './Icon.jsx';
import Avatar from './Avatar.jsx';

export default function UserPicker({ onPick, exclude = [], placeholder }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => (q.trim() ? api('/users/search?q=' + encodeURIComponent(q.trim())).then(setList).catch(() => setList([])) : setList([])), 200);
    return () => clearTimeout(t);
  }, [q]);
  const shown = list.filter(u => !exclude.includes(u.username));
  return (
    <div className="picker">
      <div className="field-icon"><Icon n="search" size={18} /><input autoFocus placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} autoCapitalize="none" autoCorrect="off" spellCheck="false" /></div>
      <ul className="results">
        {shown.map(u => (
          <li key={u.id}><button onClick={() => { onPick(u); setQ(''); setList([]); }}>
            <Avatar name={u.name} size={38} online={isOnline(u.lastActive)} />
            <span className="who"><b>{u.name}</b><span>@{u.username} · {activeText(u.lastActive)}</span></span>
          </button></li>
        ))}
        {q && !shown.length && <li className="hint">No users found for “{q}”.</li>}
      </ul>
    </div>
  );
}
