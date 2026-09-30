import { useEffect } from 'react';
import Icon from './Icon.jsx';

export default function Modal({ title, onClose, children, wide }) {
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
