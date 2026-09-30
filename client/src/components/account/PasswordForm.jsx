import { useState } from 'react';
import { api } from '../../api/client.js';
import FormMessage from './FormMessage.jsx';

const EMPTY = { currentPassword: '', newPassword: '', confirm: '' };

export default function PasswordForm() {
  const [pw, setPw] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const save = async e => {
    e.preventDefault(); setMsg(null);
    if (pw.newPassword !== pw.confirm) return setMsg({ text: 'New passwords do not match' });
    setBusy(true);
    try {
      await api('/me/password', 'PUT', { currentPassword: pw.currentPassword, newPassword: pw.newPassword });
      setPw(EMPTY); setMsg({ ok: true, text: 'Password changed' });
    } catch (x) { setMsg({ text: x.message }); }
    setBusy(false);
  };

  return (
    <form onSubmit={save} className="settings-form">
      <h4>Change password</h4>
      <label className="fld">Current password<input type="password" value={pw.currentPassword} onChange={e => setPw({ ...pw, currentPassword: e.target.value })} autoComplete="current-password" required /></label>
      <label className="fld">New password<input type="password" value={pw.newPassword} onChange={e => setPw({ ...pw, newPassword: e.target.value })} minLength={6} autoComplete="new-password" required /></label>
      <label className="fld">Confirm new password<input type="password" value={pw.confirm} onChange={e => setPw({ ...pw, confirm: e.target.value })} minLength={6} autoComplete="new-password" required /></label>
      <FormMessage msg={msg} />
      <button className="primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
    </form>
  );
}
