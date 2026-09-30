import Icon from '../ui/Icon.jsx';
import { tint } from '../../utils/avatarColor.js';
import { timeOf, dayLabel } from '../../utils/format.js';

export default function MessageBubble({ message: m, mine, isGroup, newDay, joinsPrev, joinsNext, receipt, onDelete }) {
  return (
    <div className="row-wrap">
      {newDay && <div className="day"><span>{dayLabel(m.createdAt)}</span></div>}
      <div className={'msg' + (mine ? ' mine' : '') + (joinsPrev ? '' : ' first') + (joinsNext ? '' : ' last')}>
        {isGroup && !mine && !joinsPrev && <small style={{ color: tint(m.sender.name)[0] }}>{m.sender.name} <em>@{m.sender.username}</em></small>}
        <p>{m.text}</p>
        <div className="meta">
          <time dateTime={m.createdAt}>{timeOf(m.createdAt)}</time>
          {receipt && <span className={'rcpt' + (receipt.seen ? ' seen' : '')} title={receipt.label}><Icon n={receipt.seen ? 'checks' : 'check'} size={14} strokeWidth={2.4} /><span>{receipt.label}</span></span>}
          {mine && <button className="del" onClick={() => onDelete(m._id)} aria-label="Delete message" title="Delete for everyone"><Icon n="trash" size={14} /></button>}
        </div>
      </div>
    </div>
  );
}
