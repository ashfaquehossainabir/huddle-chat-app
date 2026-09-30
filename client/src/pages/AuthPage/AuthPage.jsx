import { useState } from 'react';
import { api } from '../../api/client.js';
import { setToken } from '../../api/session.js';
import BrandLockup from '../../components/ui/BrandLockup.jsx';
import ThemeToggle from '../../components/ui/ThemeToggle.jsx';
import AuthHero from './AuthHero.jsx';
import PasswordField from './PasswordField.jsx';

/** Log in / sign up. Calls onAuth(user) once the server accepts the credentials. */
export default function AuthPage({ onAuth, theme, onToggleTheme }) {
  const [mode, setMode] = useState('login');
  const [f, setF] = useState({ name: '', username: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const login = mode === 'login';

  const submit = async e => {
    e.preventDefault();
    if (busy) return;
    setErr(''); setBusy(true);
    try { const d = await api('/auth/' + mode, 'POST', f); setToken(d.token); onAuth(d.user); }
    catch (x) { setErr(x.message); setBusy(false); }
  };

  return (
    <div className="auth">
      <ThemeToggle theme={theme} onToggle={onToggleTheme} className="auth-theme" />
      <AuthHero />
      <main className="auth-pane">
        <form onSubmit={submit} className="auth-card">
          <BrandLockup compact />
          <h1>{login ? 'Welcome back' : 'Create your account'}</h1>
          <p className="sub">{login ? 'Log in to pick up your conversations.' : 'Choose a username friends can search for.'}</p>
          {!login && <label className="fld">Full name<input placeholder="Alex Morgan" value={f.name} onChange={set('name')} autoComplete="name" required /></label>}
          <label className="fld">Username<input placeholder="alexm" value={f.username} onChange={set('username')} autoCapitalize="none" autoCorrect="off" spellCheck="false" autoComplete="username" required /></label>
          {!login && <label className="fld">Email<input type="email" placeholder="you@example.com" value={f.email} onChange={set('email')} autoCapitalize="none" autoComplete="email" required /></label>}
          <PasswordField value={f.password} onChange={set('password')} login={login} />
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
