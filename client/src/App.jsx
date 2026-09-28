import { useState, useEffect, useRef, useCallback } from 'react';

const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const api = async (path, method = 'GET', body) => {
  const res = await fetch(API + '/api' + path, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.token || '') },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { if (res.status === 401) { localStorage.removeItem('token'); } throw new Error(data.error || 'Something went wrong'); }
  return data;
};

const activeText = d => {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'Active now';
  if (m < 60) return `Active ${m} minute${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Active ${h} hour${h > 1 ? 's' : ''} ago`;
  const days = Math.floor(h / 24);
  return `Active ${days} day${days > 1 ? 's' : ''} ago`;
};

function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', username: '', password: '' });
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { const d = await api('/auth/' + mode, 'POST', f); localStorage.token = d.token; onAuth(d.user); }
    catch (x) { setErr(x.message); }
  };
  return (
    <div className="auth">
      <form onSubmit={submit} className="auth-card">
        <h1>Huddle</h1>
        <p>{mode === 'login' ? 'Log in to pick up your conversations.' : 'Create an account and choose a username friends can search for.'}</p>
        {mode === 'signup' && <input placeholder="Full name" value={f.name} onChange={set('name')} required />}
        <input placeholder="Username" value={f.username} onChange={set('username')} autoCapitalize="none" required />
        <input type="password" placeholder="Password (6+ characters)" value={f.password} onChange={set('password')} required />
        {err && <div className="error">{err}</div>}
        <button className="primary">{mode === 'login' ? 'Log in' : 'Sign up'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErr(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Have an account? Log in'}
        </button>
      </form>
    </div>
  );
}

function UserPicker({ onPick, exclude = [], placeholder }) {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  useEffect(() => {
    const t = setTimeout(() => q.trim() ? api('/users/search?q=' + encodeURIComponent(q.trim())).then(setList).catch(() => setList([])) : setList([]), 200);
    return () => clearTimeout(t);
  }, [q]);
  return (
    <div>
      <input autoFocus placeholder={placeholder} value={q} onChange={e => setQ(e.target.value)} autoCapitalize="none" />
      <ul className="results">
        {list.filter(u => !exclude.includes(u.username)).map(u => (
          <li key={u.id}><button onClick={() => { onPick(u); setQ(''); setList([]); }}><b>{u.name}</b> <span>@{u.username} · {activeText(u.lastActive)}</span></button></li>
        ))}
        {q && !list.length && <li className="hint">No users found for “{q}”.</li>}
      </ul>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <header><h3>{title}</h3><button className="icon" onClick={onClose} aria-label="Close">✕</button></header>
        {children}
      </div>
    </div>
  );
}

function NewGroup({ onDone, onClose }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState([]);
  const [err, setErr] = useState('');
  const create = async () => {
    try { onDone(await api('/groups', 'POST', { name, members: members.map(m => m.username) })); }
    catch (x) { setErr(x.message); }
  };
  return (
    <Modal title="Create a group" onClose={onClose}>
      <input placeholder="Group name" value={name} onChange={e => setName(e.target.value)} />
      <div className="chips">{members.map(m => <span key={m.id} className="chip" onClick={() => setMembers(members.filter(x => x.id !== m.id))}>@{m.username} ✕</span>)}</div>
      <UserPicker placeholder="Search username to add" exclude={members.map(m => m.username)} onPick={u => setMembers([...members, u])} />
      {err && <div className="error">{err}</div>}
      <button className="primary" disabled={!name.trim()} onClick={create}>Create group</button>
    </Modal>
  );
}

function Chat({ chat, me, onBack, onLeave, onGroupUpdate }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [panel, setPanel] = useState(false);
  const [err, setErr] = useState('');
  const [typers, setTypers] = useState([]);
  const end = useRef();
  const lastPing = useRef(0);
  const isGroup = chat.type === 'group';
  const key = isGroup ? chat.group.id : chat.user.username;
  const owner = isGroup && String(chat.group.owner) === me.id;
  const guard = fn => async (...a) => { try { setErr(''); await fn(...a); } catch (x) { setErr(x.message); } };

  const load = useCallback(() => api(`/messages?type=${chat.type}&id=${key}`).then(setMsgs).catch(e => /Not a member/.test(e.message) ? onLeave() : setErr(e.message)), [chat.type, key]);
  useEffect(() => { setMsgs([]); setErr(''); load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    setTypers([]);
    const t = setInterval(() => api(`/typing?type=${chat.type}&id=${key}`).then(setTypers).catch(() => {}), 1500);
    return () => clearInterval(t);
  }, [chat.type, key]);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [msgs.length]);

  const onType = e => {
    setText(e.target.value);
    if (Date.now() - lastPing.current > 2000) { lastPing.current = Date.now(); api('/typing', 'POST', { type: chat.type, to: key }).catch(() => {}); }
  };
  const send = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    const t = text; setText(''); lastPing.current = 0;
    try { const m = await api('/messages', 'POST', { type: chat.type, to: key, text: t }); setMsgs(x => [...x, m]); if (!isGroup) onGroupUpdate(); }
    catch (x) { setErr(x.message); setText(t); }
  };
  const del = guard(async id => { if (!confirm('Delete this message for everyone?')) return; await api('/messages/' + id, 'DELETE'); setMsgs(x => x.filter(m => m._id !== id)); });
  const clearAll = guard(async () => { if (!confirm('Delete ALL messages in this chat for everyone? This cannot be undone.')) return; await api(`/messages?type=${chat.type}&id=${key}`, 'DELETE'); setMsgs([]); });
  const addMember = guard(async u => onGroupUpdate(await api(`/groups/${key}/members`, 'POST', { username: u.username })));
  const remove = guard(async u => { if (confirm(`Remove @${u.username} from this group?`)) onGroupUpdate(await api(`/groups/${key}/members/${u.username}`, 'DELETE')); });
  const leave = guard(async () => { if (!confirm('Leave this group?')) return; await api(`/groups/${key}/leave`, 'POST'); onLeave(); });

  const receipt = m => {
    const n = (m.readBy || []).filter(id => id !== me.id).length;
    return n ? (isGroup ? `Seen by ${n}` : 'Seen') : 'Sent';
  };

  return (
    <section className="chat">
      <header>
        <button className="icon back" onClick={onBack} aria-label="Back to chats">←</button>
        <div className="avatar">{(isGroup ? chat.group.name : chat.user.name)[0].toUpperCase()}</div>
        <div className="title">
          <b>{isGroup ? chat.group.name : chat.user.name}</b>
          <span>{isGroup ? `${chat.group.members.length} members` : `@${chat.user.username} · ${activeText(chat.user.lastActive)}`}</span>
        </div>
        {isGroup ? <button className="ghost" onClick={() => setPanel(true)}>Members</button> : <button className="ghost" onClick={clearAll}>Clear chat</button>}
      </header>
      <div className="msgs">
        {!msgs.length && <p className="hint center">No messages yet. Say hello.</p>}
        {msgs.map(m => {
          const mine = (m.sender._id || m.sender.id) === me.id;
          return (
            <div key={m._id} className={'msg ' + (mine ? 'mine' : '')}>
              {isGroup && !mine && <small>{m.sender.name} · @{m.sender.username}</small>}
              <p>{m.text}</p>
              <time>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                {mine && <> · {receipt(m)} · <button className="del" onClick={() => del(m._id)}>Delete</button></>}
              </time>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      {typers.length > 0 && <div className="typing">{typers.join(', ')} {typers.length > 1 ? 'are' : 'is'} typing…</div>}
      {err && <div className="error bar">{err}</div>}
      <form className="composer" onSubmit={send}>
        <input placeholder="Write a message" value={text} onChange={onType} maxLength={2000} />
        <button className="primary" disabled={!text.trim()}>Send</button>
      </form>
      {panel && <Modal title={chat.group.name} onClose={() => setPanel(false)}>
        <ul className="results">
          {chat.group.members.map(u => (
            <li key={u._id} className="member">
              <div><b>{u.name}</b>{String(chat.group.owner) === u._id && ' (owner)'}<span>@{u.username} · {u._id === me.id ? 'You' : activeText(u.lastActive)}</span></div>
              {owner && u._id !== me.id && <button className="ghost danger" onClick={() => remove(u)}>Remove</button>}
            </li>
          ))}
        </ul>
        <UserPicker placeholder="Add someone by username" exclude={chat.group.members.map(m => m.username)} onPick={addMember} />
        {err && <div className="error">{err}</div>}
        {owner && <button className="ghost danger wide" onClick={clearAll}>Delete all messages</button>}
        <button className="ghost danger wide" onClick={leave}>Leave group</button>
      </Modal>}
    </section>
  );
}

export default function App() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('groups');
  const [data, setData] = useState({ groups: [], direct: [] });
  const [active, setActive] = useState(null);
  const [modal, setModal] = useState(null);

  useEffect(() => { localStorage.token ? api('/me').then(setMe).catch(() => {}).finally(() => setReady(true)) : setReady(true); }, []);
  const refresh = useCallback(() => api('/chats').then(setData).catch(() => {}), []);
  useEffect(() => { if (me) { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); } }, [me, refresh]);

  if (!ready) return null;
  if (!me) return <AuthScreen onAuth={setMe} />;

  const liveChat = active && (active.type === 'group'
    ? { type: 'group', group: (g => g ? { ...g, id: g._id } : active.group)(data.groups.find(x => x._id === active.group.id)) }
    : { type: 'dm', user: data.direct.find(d => d.username === active.user.username) || active.user });

  const openGroup = g => { setActive({ type: 'group', group: { ...g, id: g._id } }); setTab('groups'); };
  const openDm = u => { setActive({ type: 'dm', user: u }); setTab('direct'); setModal(null); if (!data.direct.some(d => d.username === u.username)) setData(d => ({ ...d, direct: [u, ...d.direct] })); };
  const onGroupUpdate = g => { refresh(); if (g?.members) setActive(a => a && { ...a, group: { ...g, id: g._id } }); };
  const logout = () => { localStorage.removeItem('token'); setMe(null); setActive(null); };

  return (
    <div className={'app ' + (active ? 'chat-open' : '')}>
      <aside className="side">
        <header>
          <div><b>{me.name}</b><span>@{me.username}</span></div>
          <button className="ghost" onClick={logout}>Log out</button>
        </header>
        <nav className="tabs">
          <button className={tab === 'groups' ? 'on' : ''} onClick={() => setTab('groups')}>Groups</button>
          <button className={tab === 'direct' ? 'on' : ''} onClick={() => setTab('direct')}>Direct</button>
        </nav>
        <button className="primary new" onClick={() => setModal(tab)}>{tab === 'groups' ? 'New group' : 'New message'}</button>
        <ul className="list">
          {tab === 'groups' && data.groups.map(g => (
            <li key={g._id}><button className={active?.type === 'group' && active.group.id === g._id ? 'on' : ''} onClick={() => openGroup(g)}>
              <div className="avatar">{g.name[0].toUpperCase()}</div><div><b>{g.name}</b><span>{g.members.length} members</span></div></button></li>
          ))}
          {tab === 'direct' && data.direct.map(u => (
            <li key={u.id}><button className={active?.type === 'dm' && active.user.username === u.username ? 'on' : ''} onClick={() => openDm(u)}>
              <div className="avatar">{u.name[0].toUpperCase()}</div><div><b>{u.name}</b><span>{activeText(u.lastActive)}</span></div></button></li>
          ))}
          {tab === 'groups' && !data.groups.length && <li className="hint">You haven’t joined any groups. Create one to start.</li>}
          {tab === 'direct' && !data.direct.length && <li className="hint">No conversations yet. Search a username to message someone.</li>}
        </ul>
      </aside>
      <main>
        {active ? <Chat key={active.type + (active.group?._id || active.user?.username)} chat={liveChat} me={me} onBack={() => setActive(null)} onLeave={() => { setActive(null); refresh(); }} onGroupUpdate={onGroupUpdate} />
          : <div className="empty"><h2>Pick a conversation</h2><p>Choose a group or a direct chat from the sidebar.</p></div>}
      </main>
      {modal === 'groups' && <NewGroup onClose={() => setModal(null)} onDone={g => { setModal(null); refresh(); openGroup(g); }} />}
      {modal === 'direct' && <Modal title="Message someone" onClose={() => setModal(null)}><UserPicker placeholder="Search by username" onPick={openDm} /></Modal>}
    </div>
  );
}
