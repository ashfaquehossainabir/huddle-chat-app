import { useState, useEffect, useRef, useCallback } from 'react';

/* ───────────── API ───────────── */
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

/* ───────────── helpers ───────────── */
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
const isOnline = d => !!d && Date.now() - new Date(d) < 120000;
const initialTheme = () => localStorage.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const timeOf = d => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
const dayKey = d => new Date(d).toDateString();
const dayLabel = d => {
  const date = new Date(d), today = new Date(), y = new Date();
  y.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === y.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', ...(date.getFullYear() !== today.getFullYear() && { year: 'numeric' }) });
};
const PALETTE = [['#0b7a6b', '#fff'], ['#e8735a', '#fff'], ['#f4b942', '#3a2a00'], ['#5566d6', '#fff'], ['#b5479b', '#fff'], ['#238db3', '#fff'], ['#6f8f22', '#fff'], ['#d0526a', '#fff']];
const tint = name => { let h = 0; for (const c of String(name || '?')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return PALETTE[h % PALETTE.length]; };

/* ───────────── icons ───────────── */
const PATHS = {
  send: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  sliders: <><path d="M21 4h-7M10 4H3M21 12h-9M8 12H3M21 20h-5M12 20H3M14 2v4M8 10v4M16 18v4" /></>,
  logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></>,
  moon: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />,
  back: <path d="m15 18-6-6 6-6" />,
  trash: <><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  x: <path d="M18 6 6 18M6 6l12 12" />,
  check: <path d="m20 6-11 11-5-5" />,
  checks: <><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></>,
  down: <path d="M12 5v14m7-7-7 7-7-7" />,
  eye: <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></>,
  eyeOff: <><path d="M9.9 4.24A9.1 9.1 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-2.16 3.19M6.61 6.61A17.5 17.5 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.39-1.61M2 2l20 20" /></>,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  eraser: <><path d="m7 21-4.3-4.3a1 1 0 0 1 0-1.4l9.6-9.6a1 1 0 0 1 1.4 0l5.6 5.6a1 1 0 0 1 0 1.4L13 21" /><path d="M22 21H7M5 11l9 9" /></>,
};
const Icon = ({ n, size = 20, ...p }) => (
  <svg className="ic" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>{PATHS[n]}</svg>
);

/* three overlapping circles: the Huddle mark */
const Mark = ({ size = 34 }) => (
  <svg className="mark" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="24" cy="34" r="16" fill="var(--brand)" />
    <circle cx="42" cy="28" r="14" fill="var(--sun)" />
    <circle cx="36" cy="44" r="11" fill="var(--coral)" />
  </svg>
);

const Avatar = ({ name = '?', group, size = 44, online }) => {
  const [bg, fg] = tint(name);
  return (
    <span className={'avatar' + (group ? ' is-group' : '')} style={{ '--sz': size + 'px', '--av': bg, '--avfg': fg }} aria-hidden="true">
      {(name[0] || '?').toUpperCase()}
      {online && <i className="dot" />}
    </span>
  );
};

/* ───────────── shared UI ───────────── */
function ThemeToggle({ theme, onToggle, className = '' }) {
  const dark = theme === 'dark';
  return (
    <button type="button" className={'icon-btn ' + className} onClick={onToggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
      <Icon n={dark ? 'sun' : 'moon'} size={19} />
    </button>
  );
}

function Modal({ title, onClose, children, wide }) {
  useEffect(() => {
    const k = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  return (
    <div className="scrim" onClick={onClose}>
      <div className={'modal' + (wide ? ' wide-modal' : '')} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <span className="grab" aria-hidden="true" />
        <header className="modal-head"><h3>{title}</h3><button className="icon-btn" onClick={onClose} aria-label="Close"><Icon n="x" size={18} /></button></header>
        {children}
      </div>
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

/* ───────────── auth ───────────── */
function AuthScreen({ onAuth, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [show, setShow] = useState(false);
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setErr(''); setBusy(true);
    try { const d = await api('/auth/' + mode, 'POST', f); localStorage.token = d.token; onAuth(d.user); }
    catch (x) { setErr(x.message); setBusy(false); }
  };
  const login = mode === 'login';
  return (
    <div className="auth">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} className="auth-theme" />
      <section className="auth-hero" aria-hidden="true">
        <div className="brand-lockup"><Mark size={46} /><span>Huddle</span></div>
        <h2>Your people,<br />one tap away.</h2>
        <p>Message friends one-to-one or gather a group. Find anyone by username.</p>
        <div className="preview">
          <div className="pv-row"><Avatar name="Maya" size={34} /><div className="pv-bubble in">Are we still on for Friday?</div></div>
          <div className="pv-row me"><div className="pv-bubble out">Yes! I’ll bring the snacks.</div></div>
          <div className="pv-row"><Avatar name="Jonas" size={34} /><div className="pv-bubble in typing-b"><i /><i /><i /></div></div>
        </div>
      </section>
      <main className="auth-pane">
        <form onSubmit={submit} className="auth-card">
          <div className="brand-lockup compact"><Mark size={34} /><span>Huddle</span></div>
          <h1>{login ? 'Welcome back' : 'Create your account'}</h1>
          <p className="sub">{login ? 'Log in to pick up your conversations.' : 'Choose a username friends can search for.'}</p>
          {!login && <label className="fld">Full name<input placeholder="Alex Morgan" value={f.name} onChange={set('name')} autoComplete="name" required /></label>}
          <label className="fld">Username<input placeholder="alexm" value={f.username} onChange={set('username')} autoCapitalize="none" autoCorrect="off" spellCheck="false" autoComplete="username" required /></label>
          {!login && <label className="fld">Email<input type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} autoCapitalize="none" autoComplete="email" required /></label>}
          <label className="fld">Password
            <span className="pw">
              <input type={show ? 'text' : 'password'} placeholder="6+ characters" value={f.password} onChange={set('password')} autoComplete={login ? 'current-password' : 'new-password'} required />
              <button type="button" className="pw-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Icon n={show ? 'eyeOff' : 'eye'} size={18} /></button>
            </span>
          </label>
          {err && <div className="error" role="alert">{err}</div>}
          <button className="primary block" disabled={busy}>{busy ? 'Please wait…' : login ? 'Log in' : 'Sign up'}</button>
          {busy && <p className="hint center">The server may take up to a minute to wake up. Please don’t click again.</p>}
          <button type="button" className="link" onClick={() => { setMode(login ? 'signup' : 'login'); setErr(''); }}>
            {login ? 'New here? Create an account' : 'Have an account? Log in'}
          </button>
        </form>
      </main>
    </div>
  );
}

/* ───────────── settings / group modals ───────────── */
function ConfirmLogout({ onConfirm, onClose }) {
  return (
    <Modal title="Log out?" onClose={onClose}>
      <p className="hint confirm-text">Are you sure you want to log out of Huddle?</p>
      <div className="actions">
        <button className="ghost" onClick={onClose}>Cancel</button>
        <button className="primary" onClick={onConfirm}>Log out</button>
      </div>
    </Modal>
  );
}

function Settings({ me, onSaved, onClose }) {
  const [p, setP] = useState({ name: me.name, email: me.email || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pMsg, setPMsg] = useState(null);
  const [wMsg, setWMsg] = useState(null);
  const [busy, setBusy] = useState('');
  const saveProfile = async e => {
    e.preventDefault(); setPMsg(null); setBusy('profile');
    try { onSaved(await api('/me', 'PATCH', p)); setPMsg({ ok: true, text: 'Profile updated' }); }
    catch (x) { setPMsg({ text: x.message }); }
    setBusy('');
  };
  const savePassword = async e => {
    e.preventDefault(); setWMsg(null);
    if (pw.newPassword !== pw.confirm) return setWMsg({ text: 'New passwords do not match' });
    setBusy('password');
    try { await api('/me/password', 'PUT', { currentPassword: pw.currentPassword, newPassword: pw.newPassword }); setPw({ currentPassword: '', newPassword: '', confirm: '' }); setWMsg({ ok: true, text: 'Password changed' }); }
    catch (x) { setWMsg({ text: x.message }); }
    setBusy('');
  };
  const msg = m => m && <div className={m.ok ? 'ok' : 'error'} role="status">{m.text}</div>;
  return (
    <Modal title="Account settings" onClose={onClose} wide>
      <div className="me-card"><Avatar name={me.name} size={52} /><div className="who"><b>{me.name}</b><span>@{me.username}</span></div></div>
      <form onSubmit={saveProfile} className="settings-form">
        <h4>Profile</h4>
        <label className="fld">Full name<input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} required /></label>
        <label className="fld">Username<input value={'@' + me.username} disabled /></label>
        <label className="fld">Email<input type="email" value={p.email} onChange={e => setP({ ...p, email: e.target.value })} autoCapitalize="none" autoComplete="email" required /></label>
        {msg(pMsg)}
        <button className="primary" disabled={busy === 'profile'}>{busy === 'profile' ? 'Saving…' : 'Save changes'}</button>
      </form>
      <form onSubmit={savePassword} className="settings-form">
        <h4>Change password</h4>
        <label className="fld">Current password<input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" required /></label>
        <label className="fld">New password<input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} minLength={6} autoComplete="new-password" required /></label>
        <label className="fld">Confirm new password<input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} minLength={6} autoComplete="new-password" required /></label>
        {msg(wMsg)}
        <button className="primary" disabled={busy === 'password'}>{busy === 'password' ? 'Updating…' : 'Update password'}</button>
      </form>
    </Modal>
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
      <label className="fld">Group name<input placeholder="Weekend plans" value={name} onChange={e => setName(e.target.value)} maxLength={60} /></label>
      {members.length > 0 && <div className="chips">{members.map(m => <button key={m.id} className="chip" onClick={() => setMembers(members.filter(x => x.id !== m.id))} aria-label={`Remove @${m.username}`}>@{m.username}<Icon n="x" size={13} /></button>)}</div>}
      <UserPicker placeholder="Search username to add" exclude={members.map(m => m.username)} onPick={u => setMembers([...members, u])} />
      {err && <div className="error" role="alert">{err}</div>}
      <button className="primary block" disabled={!name.trim()} onClick={create}>Create group</button>
    </Modal>
  );
}

/* ───────────── chat ───────────── */
function Chat({ chat, me, onBack, onLeave, onGroupUpdate }) {
  const [msgs, setMsgs] = useState([]);
  const [text, setText] = useState('');
  const [panel, setPanel] = useState(false);
  const [err, setErr] = useState('');
  const [typers, setTypers] = useState([]);
  const [away, setAway] = useState(false);
  const box = useRef();
  const end = useRef();
  const ta = useRef();
  const stick = useRef(true);
  const first = useRef(true);
  const lastPing = useRef(0);
  const isGroup = chat.type === 'group';
  const key = isGroup ? chat.group.id : chat.user.username;
  const owner = isGroup && String(chat.group.owner) === me.id;
  const title = isGroup ? chat.group.name : chat.user.name;
  const guard = fn => async (...a) => { try { setErr(''); await fn(...a); } catch (x) { setErr(x.message); } };

  const load = useCallback(() => api(`/messages?type=${chat.type}&id=${key}`).then(setMsgs).catch(e => /Not a member/.test(e.message) ? onLeave() : setErr(e.message)), [chat.type, key]);
  useEffect(() => { setMsgs([]); setErr(''); load(); const t = setInterval(load, 3000); return () => clearInterval(t); }, [load]);
  useEffect(() => {
    setTypers([]);
    const t = setInterval(() => api(`/typing?type=${chat.type}&id=${key}`).then(setTypers).catch(() => {}), 1500);
    return () => clearInterval(t);
  }, [chat.type, key]);

  useEffect(() => {
    if (!msgs.length) return;
    const lastMine = (msgs[msgs.length - 1].sender._id || msgs[msgs.length - 1].sender.id) === me.id;
    if (stick.current || lastMine) end.current?.scrollIntoView({ block: 'end', behavior: first.current ? 'auto' : 'smooth' });
    first.current = false;
  }, [msgs.length]);

  useEffect(() => { const el = ta.current; if (!el) return; el.style.height = 'auto'; const b = el.offsetHeight - el.clientHeight; const h = el.scrollHeight + b; el.style.height = Math.min(h, 140) + 'px'; el.style.overflowY = h > 140 ? 'auto' : 'hidden'; }, [text]);

  const onScroll = () => {
    const el = box.current;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stick.current = near;
    setAway(a => (a === !near ? a : !near));
  };
  const jump = () => end.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });

  const onType = e => {
    setText(e.target.value);
    if (Date.now() - lastPing.current > 2000) { lastPing.current = Date.now(); api('/typing', 'POST', { type: chat.type, to: key }).catch(() => {}); }
  };
  const send = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    const t = text; setText(''); lastPing.current = 0; stick.current = true;
    try { const m = await api('/messages', 'POST', { type: chat.type, to: key, text: t }); setMsgs(x => [...x, m]); if (!isGroup) onGroupUpdate(); }
    catch (x) { setErr(x.message); setText(t); }
  };
  const onKey = e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) send(e); };
  const del = guard(async id => { if (!confirm('Delete this message for everyone?')) return; await api('/messages/' + id, 'DELETE'); setMsgs(x => x.filter(m => m._id !== id)); });
  const clearAll = guard(async () => { if (!confirm('Delete ALL messages in this chat for everyone? This cannot be undone.')) return; await api(`/messages?type=${chat.type}&id=${key}`, 'DELETE'); setMsgs([]); });
  const addMember = guard(async u => onGroupUpdate(await api(`/groups/${key}/members`, 'POST', { username: u.username })));
  const remove = guard(async u => { if (confirm(`Remove @${u.username} from this group?`)) onGroupUpdate(await api(`/groups/${key}/members/${u.username}`, 'DELETE')); });
  const leave = guard(async () => { if (!confirm('Leave this group?')) return; await api(`/groups/${key}/leave`, 'POST'); onLeave(); });

  const receipt = m => {
    const n = (m.readBy || []).filter(id => id !== me.id).length;
    return n ? { seen: true, label: isGroup ? `Seen by ${n}` : 'Seen' } : { seen: false, label: 'Sent' };
  };
  const sid = m => m.sender._id || m.sender.id;
  const online = !isGroup && isOnline(chat.user.lastActive);

  return (
    <section className="chat">
      <header className="chat-head">
        <button className="icon-btn back" onClick={onBack} aria-label="Back to chats"><Icon n="back" size={22} /></button>
        <Avatar name={title} group={isGroup} size={44} online={online} />
        <div className="title">
          <b>{title}</b>
          <span className={online ? 'live' : ''}>{isGroup ? `${chat.group.members.length} members` : `@${chat.user.username} · ${activeText(chat.user.lastActive)}`}</span>
        </div>
        {isGroup
          ? <button className="ghost with-icon" onClick={() => setPanel(true)} aria-label="Members"><Icon n="users" size={18} /><span className="lbl">Members</span></button>
          : <button className="ghost with-icon" onClick={clearAll} aria-label="Clear chat"><Icon n="eraser" size={18} /><span className="lbl">Clear chat</span></button>}
      </header>

      <div className="msgs-wrap">
        <div className="msgs" ref={box} onScroll={onScroll}>
          {!msgs.length && (
            <div className="chat-empty"><Icon n="chat" size={30} /><p>No messages yet. Say hello.</p></div>
          )}
          {msgs.map((m, i) => {
            const mine = sid(m) === me.id;
            const prev = msgs[i - 1], next = msgs[i + 1];
            const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
            const joinsPrev = prev && !newDay && sid(prev) === sid(m) && new Date(m.createdAt) - new Date(prev.createdAt) < 300000;
            const joinsNext = next && dayKey(next.createdAt) === dayKey(m.createdAt) && sid(next) === sid(m) && new Date(next.createdAt) - new Date(m.createdAt) < 300000;
            const r = mine ? receipt(m) : null;
            return (
              <div key={m._id} className="row-wrap">
                {newDay && <div className="day"><span>{dayLabel(m.createdAt)}</span></div>}
                <div className={'msg' + (mine ? ' mine' : '') + (joinsPrev ? '' : ' first') + (joinsNext ? '' : ' last')}>
                  {isGroup && !mine && !joinsPrev && <small style={{ color: tint(m.sender.name)[0] }}>{m.sender.name} <em>@{m.sender.username}</em></small>}
                  <p>{m.text}</p>
                  <div className="meta">
                    <time dateTime={m.createdAt}>{timeOf(m.createdAt)}</time>
                    {r && <span className={'rcpt' + (r.seen ? ' seen' : '')} title={r.label}><Icon n={r.seen ? 'checks' : 'check'} size={14} strokeWidth={2.4} /><span>{r.label}</span></span>}
                    {mine && <button className="del" onClick={() => del(m._id)} aria-label="Delete message" title="Delete for everyone"><Icon n="trash" size={14} /></button>}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={end} />
        </div>
        {away && <button className="jump" onClick={jump} aria-label="Jump to latest message"><Icon n="down" size={20} /></button>}
      </div>

      {typers.length > 0 && <div className="typing" aria-live="polite"><span className="dots"><i /><i /><i /></span>{typers.join(', ')} {typers.length > 1 ? 'are' : 'is'} typing…</div>}
      {err && <div className="error bar" role="alert">{err}</div>}
      <form className="composer" onSubmit={send}>
        <div className="box">
          <textarea ref={ta} rows={1} placeholder="Write a message" value={text} onChange={onType} onKeyDown={onKey} maxLength={2000} enterKeyHint="send" aria-label="Message" />
          {text.length > 1800 && <span className="count">{2000 - text.length}</span>}
        </div>
        <button className="send" disabled={!text.trim()} aria-label="Send message"><Icon n="send" size={20} /></button>
      </form>

      {panel && <Modal title={chat.group.name} onClose={() => setPanel(false)}>
        <p className="section-label">{chat.group.members.length} members</p>
        <ul className="results members">
          {chat.group.members.map(u => (
            <li key={u._id} className="member">
              <Avatar name={u.name} size={40} online={u._id === me.id || isOnline(u.lastActive)} />
              <div className="who"><b>{u.name}{String(chat.group.owner) === u._id && <em className="badge">Owner</em>}</b><span>@{u.username} · {u._id === me.id ? 'You' : activeText(u.lastActive)}</span></div>
              {owner && u._id !== me.id && <button className="ghost danger" onClick={() => remove(u)}>Remove</button>}
            </li>
          ))}
        </ul>
        <p className="section-label">Add people</p>
        <UserPicker placeholder="Add someone by username" exclude={chat.group.members.map(m => m.username)} onPick={addMember} />
        {err && <div className="error" role="alert">{err}</div>}
        <div className="danger-zone">
          {owner && <button className="ghost danger wide" onClick={clearAll}>Delete all messages</button>}
          <button className="ghost danger wide" onClick={leave}>Leave group</button>
        </div>
      </Modal>}
    </section>
  );
}

/* ───────────── app shell ───────────── */
export default function App() {
  const [me, setMe] = useState(null);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('groups');
  const [data, setData] = useState({ groups: [], direct: [] });
  const [active, setActive] = useState(null);
  const [modal, setModal] = useState(null);
  const [q, setQ] = useState('');
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.theme = theme; }, [theme]);
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  useEffect(() => { localStorage.token ? api('/me').then(setMe).catch(() => {}).finally(() => setReady(true)) : setReady(true); }, []);
  const refresh = useCallback(() => api('/chats').then(setData).catch(() => {}), []);
  useEffect(() => { if (me) { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); } }, [me, refresh]);

  if (!ready) return <div className="boot"><Mark size={56} /></div>;
  if (!me) return <AuthScreen onAuth={setMe} theme={theme} onToggleTheme={toggleTheme} />;

  const liveChat = active && (active.type === 'group'
    ? { type: 'group', group: (g => g ? { ...g, id: g._id } : active.group)(data.groups.find(x => x._id === active.group.id)) }
    : { type: 'dm', user: data.direct.find(d => d.username === active.user.username) || active.user });

  const openGroup = g => { setActive({ type: 'group', group: { ...g, id: g._id } }); setTab('groups'); };
  const openDm = u => { setActive({ type: 'dm', user: u }); setTab('direct'); setModal(null); if (!data.direct.some(d => d.username === u.username)) setData(d => ({ ...d, direct: [u, ...d.direct] })); };
  const onGroupUpdate = g => { refresh(); if (g?.members) setActive(a => a && { ...a, group: { ...g, id: g._id } }); };
  const logout = () => { localStorage.removeItem('token'); setMe(null); setActive(null); };

  const needle = q.trim().toLowerCase();
  const groups = data.groups.filter(g => !needle || g.name.toLowerCase().includes(needle));
  const direct = data.direct.filter(u => !needle || u.name.toLowerCase().includes(needle) || u.username.toLowerCase().includes(needle));

  return (
    <div className={'app ' + (active ? 'chat-open' : '')}>
      <aside className="side">
        <div className="side-top">
          <div className="brand-lockup compact"><Mark size={30} /><span>Huddle</span></div>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </div>
        <div className="me-row">
          <Avatar name={me.name} size={42} online />
          <div className="who"><b>{me.name}</b><span>@{me.username}</span></div>
          <button className="icon-btn" onClick={() => setModal('settings')} aria-label="Account settings" title="Settings"><Icon n="sliders" size={19} /></button>
          <button className="icon-btn" onClick={() => setModal('logout')} aria-label="Log out" title="Log out"><Icon n="logout" size={19} /></button>
        </div>
        <div className="field-icon filter"><Icon n="search" size={18} /><input placeholder={tab === 'groups' ? 'Search groups' : 'Search chats'} value={q} onChange={e => setQ(e.target.value)} aria-label="Filter conversations" autoCapitalize="none" /></div>
        <nav className="tabs" role="tablist">
          <button role="tab" aria-selected={tab === 'groups'} className={tab === 'groups' ? 'on' : ''} onClick={() => setTab('groups')}>Groups<em>{data.groups.length}</em></button>
          <button role="tab" aria-selected={tab === 'direct'} className={tab === 'direct' ? 'on' : ''} onClick={() => setTab('direct')}>Direct<em>{data.direct.length}</em></button>
        </nav>
        <ul className="list">
          {tab === 'groups' && groups.map(g => (
            <li key={g._id}><button className={active?.type === 'group' && active.group.id === g._id ? 'on' : ''} onClick={() => openGroup(g)}>
              <Avatar name={g.name} group size={46} /><span className="who"><b>{g.name}</b><span>{g.members.length} members</span></span></button></li>
          ))}
          {tab === 'direct' && direct.map(u => (
            <li key={u.id}><button className={active?.type === 'dm' && active.user.username === u.username ? 'on' : ''} onClick={() => openDm(u)}>
              <Avatar name={u.name} size={46} online={isOnline(u.lastActive)} /><span className="who"><b>{u.name}</b><span>{activeText(u.lastActive)}</span></span></button></li>
          ))}
          {tab === 'groups' && !data.groups.length && <li className="hint">You haven’t joined any groups. Create one to start.</li>}
          {tab === 'direct' && !data.direct.length && <li className="hint">No conversations yet. Search a username to message someone.</li>}
          {needle && ((tab === 'groups' && data.groups.length && !groups.length) || (tab === 'direct' && data.direct.length && !direct.length)) && <li className="hint">Nothing matches “{q}”.</li>}
        </ul>
        <button className="primary new" onClick={() => setModal(tab)}><Icon n="plus" size={19} strokeWidth={2.4} />{tab === 'groups' ? 'New group' : 'New message'}</button>
      </aside>
      <main>
        {active ? <Chat key={active.type + (active.group?._id || active.user?.username)} chat={liveChat} me={me} onBack={() => setActive(null)} onLeave={() => { setActive(null); refresh(); }} onGroupUpdate={onGroupUpdate} />
          : <div className="empty"><div className="empty-art" aria-hidden="true"><Mark size={92} /></div><h2>Pick a conversation</h2><p>Choose a group or a direct chat from the sidebar, or start a new one.</p></div>}
      </main>
      {modal === 'settings' && <Settings me={me} onSaved={setMe} onClose={() => setModal(null)} />}
      {modal === 'logout' && <ConfirmLogout onClose={() => setModal(null)} onConfirm={() => { setModal(null); logout(); }} />}
      {modal === 'groups' && <NewGroup onClose={() => setModal(null)} onDone={g => { setModal(null); refresh(); openGroup(g); }} />}
      {modal === 'direct' && <Modal title="Message someone" onClose={() => setModal(null)}><UserPicker placeholder="Search by username" onPick={openDm} /></Modal>}
    </div>
  );
}
