import { useState, useRef } from 'react';
import Icon from '../ui/Icon.jsx';
import { useAutoGrow } from '../../hooks/useAutoGrow.js';

const MAX_LENGTH = 2000;
const TYPING_PING_MS = 2000;

/**
 * Message input. `onSend(text)` should return a promise that rejects on failure
 * (the draft is then restored). `onTyping()` is throttled to one call per 2s.
 */
export default function Composer({ onSend, onTyping }) {
  const [text, setText] = useState('');
  const ta = useRef();
  const lastPing = useRef(0);
  useAutoGrow(ta, text);

  const handleChange = e => {
    setText(e.target.value);
    if (Date.now() - lastPing.current > TYPING_PING_MS) { lastPing.current = Date.now(); onTyping(); }
  };
  const submit = async e => {
    e.preventDefault();
    if (!text.trim()) return;
    const draft = text;
    setText(''); lastPing.current = 0;
    try { await onSend(draft); } catch { setText(draft); }
  };
  const handleKey = e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) submit(e); };

  return (
    <form className="composer" onSubmit={submit}>
      <div className="box">
        <textarea ref={ta} rows={1} placeholder="Write a message" value={text} onChange={handleChange} onKeyDown={handleKey} maxLength={MAX_LENGTH} enterKeyHint="send" aria-label="Message" />
        {text.length > 1800 && <span className="count">{MAX_LENGTH - text.length}</span>}
      </div>
      <button className="send" disabled={!text.trim()} aria-label="Send message"><Icon n="send" size={20} /></button>
    </form>
  );
}
