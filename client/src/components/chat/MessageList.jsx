import Icon from '../ui/Icon.jsx';
import MessageBubble from './MessageBubble.jsx';
import { dayKey } from '../../utils/format.js';
import { senderId, receiptFor, GROUP_WINDOW_MS } from '../../utils/message.js';

export default function MessageList({ msgs, meId, isGroup, scroll, onDelete }) {
  const { boxRef, endRef, away, onScroll, jump } = scroll;
  return (
    <div className="msgs-wrap">
      <div className="msgs" ref={boxRef} onScroll={onScroll}>
        {!msgs.length && (
          <div className="chat-empty"><Icon n="chat" size={30} /><p>No messages yet. Say hello.</p></div>
        )}
        {msgs.map((m, i) => {
          const mine = senderId(m) === meId;
          const prev = msgs[i - 1], next = msgs[i + 1];
          const newDay = !prev || dayKey(prev.createdAt) !== dayKey(m.createdAt);
          const joinsPrev = prev && !newDay && senderId(prev) === senderId(m) && new Date(m.createdAt) - new Date(prev.createdAt) < GROUP_WINDOW_MS;
          const joinsNext = next && dayKey(next.createdAt) === dayKey(m.createdAt) && senderId(next) === senderId(m) && new Date(next.createdAt) - new Date(m.createdAt) < GROUP_WINDOW_MS;
          return (
            <MessageBubble
              key={m._id}
              message={m}
              mine={mine}
              isGroup={isGroup}
              newDay={newDay}
              joinsPrev={joinsPrev}
              joinsNext={joinsNext}
              receipt={mine ? receiptFor(m, meId, isGroup) : null}
              onDelete={onDelete}
            />
          );
        })}
        <div ref={endRef} />
      </div>
      {away && <button className="jump" onClick={jump} aria-label="Jump to latest message"><Icon n="down" size={20} /></button>}
    </div>
  );
}
