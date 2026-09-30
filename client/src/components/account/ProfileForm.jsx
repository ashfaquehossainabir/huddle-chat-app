import { useState } from 'react';
import { api } from '../../api/client.js';
import FormMessage from './FormMessage.jsx';

export default function ProfileForm({ me, onSaved }) {
  const [p, setP] = useState({ name: me.name, email: me.email || '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = async e => {
    e.preventDefault(); setMsg(null); setBusy(true);
    try { onSaved(await api('/me', 'PATCH', p)); setMsg({ ok: true, text: 'Profile updated' }); }
    catch (x) { setMsg({ text: x.message }); }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="settings-form">
      <h4>Profile</h4>
      <label className="fld">Full name<input value={p.name} onChange={e => setP({ ...p, name: e.target.value })} required /></label>
      <label className="fld">Username<input value={'@' + me.username} disabled /></label>
      <label className="fld">Email<input type="email" value={p.email} onChange={e => setP({ ...p, email: e.target.value })} autoCapitalize="none" autoComplete="email" required /></label>
      <FormMessage msg={msg} />
      <button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
    </form>
  );
}
