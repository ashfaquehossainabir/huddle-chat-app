import { useState } from 'react';
import Icon from '../../components/ui/Icon.jsx';

export default function PasswordField({ value, onChange, login }) {
  const [show, setShow] = useState(false);
  return (
    <label className="fld">Password
      <span className="pw">
        <input type={show ? 'text' : 'password'} placeholder="6+ characters" value={value} onChange={onChange} autoComplete={login ? 'current-password' : 'new-password'} required />
        <button type="button" className="pw-btn" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}><Icon n={show ? 'eyeOff' : 'eye'} size={18} /></button>
      </span>
    </label>
  );
}
