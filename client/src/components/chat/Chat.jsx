import { useState } from 'react';
import { api } from '../../api/client.js';
import { isOnline } from '../../utils/format.js';
import { useMessages } from '../../hooks/useMessages.js';
import { useTypingUsers } from '../../hooks/useTypingUsers.js';
import { useAutoScroll } from '../../hooks/useAutoScroll.js';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import Composer from './Composer.jsx';
import MembersModal from '../groups/MembersModal.jsx';

export default function Chat({ chat, me, onBack, onLeave, onGroupUpdate }) {
  const [panel, setPanel] = useState(false);
  const isGroup = chat.type === 'group';
  const key = isGroup ? chat.group.id : chat.user.username;
  const isOwner = isGroup && String(chat.group.owner) === me.id;
  const title = isGroup ? chat.group.name : chat.user.name;
  const online = !isGroup && isOnline(chat.user.lastActive);

  const { msgs, setMsgs, err, setErr } = useMessages(chat.type, key, onLeave);
  const typers = useTypingUsers(chat.type, key);
  const scroll = useAutoScroll(msgs, me.id);

  /** Runs an async action, surfacing failures in the error bar. */
  const guard = fn => async (...a) => { try { setErr(''); await fn(...a); } catch (x) { setErr(x.message); } };

  const sendMessage = async text => {
    scroll.stickToBottom();
    try {
      const m = await api('/messages', 'POST', { type: chat.type, to: key, text });
      setMsgs(x => [...x, m]);
      if (!isGroup) onGroupUpdate();
    } catch (x) { setErr(x.message); throw x; }
  };
  const sendTyping = () => api('/typing', 'POST', { type: chat.type, to: key }).catch(() => {});

  const deleteMessage = guard(async id => {
    if (!confirm('Delete this message for everyone?')) return;
    await api('/messages/' + id, 'DELETE');
    setMsgs(x => x.filter(m => m._id !== id));
  });
  const clearAll = guard(async () => {
    if (!confirm('Delete ALL messages in this chat for everyone? This cannot be undone.')) return;
    await api(`/messages?type=${chat.type}&id=${key}`, 'DELETE');
    setMsgs([]);
  });
  const addMember = guard(async u => onGroupUpdate(await api(`/groups/${key}/members`, 'POST', { username: u.username })));
  const removeMember = guard(async u => { if (confirm(`Remove @${u.username} from this group?`)) onGroupUpdate(await api(`/groups/${key}/members/${u.username}`, 'DELETE')); });
  const leaveGroup = guard(async () => { if (!confirm('Leave this group?')) return; await api(`/groups/${key}/leave`, 'POST'); onLeave(); });

  return (
    <section className="chat">
      <ChatHeader chat={chat} title={title} online={online} onBack={onBack} onOpenMembers={() => setPanel(true)} onClearChat={clearAll} />
      <MessageList msgs={msgs} meId={me.id} isGroup={isGroup} scroll={scroll} onDelete={deleteMessage} />
      <TypingIndicator typers={typers} />
      {err && <div className="error bar" role="alert">{err}</div>}
      <Composer onSend={sendMessage} onTyping={sendTyping} />
      {panel && (
        <MembersModal
          group={chat.group}
          me={me}
          isOwner={isOwner}
          err={err}
          onAdd={addMember}
          onRemove={removeMember}
          onClearAll={clearAll}
          onLeave={leaveGroup}
          onClose={() => setPanel(false)}
        />
      )}
    </section>
  );
}
