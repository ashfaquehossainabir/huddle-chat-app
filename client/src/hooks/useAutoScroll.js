import { useState, useEffect, useRef } from 'react';
import { senderId } from '../utils/message.js';

/**
 * Keeps the message list pinned to the bottom when new messages arrive
 * (unless the reader scrolled up), and tracks whether to show "jump to latest".
 */
export function useAutoScroll(msgs, meId) {
  const boxRef = useRef();
  const endRef = useRef();
  const stick = useRef(true);
  const first = useRef(true);
  const [away, setAway] = useState(false);

  useEffect(() => {
    if (!msgs.length) return;
    const lastMine = senderId(msgs[msgs.length - 1]) === meId;
    if (stick.current || lastMine) endRef.current?.scrollIntoView({ block: 'end', behavior: first.current ? 'auto' : 'smooth' });
    first.current = false;
  }, [msgs.length]);

  const onScroll = () => {
    const el = boxRef.current;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    stick.current = near;
    setAway(a => (a === !near ? a : !near));
  };
  const jump = () => endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  const stickToBottom = () => { stick.current = true; };

  return { boxRef, endRef, away, onScroll, jump, stickToBottom };
}
