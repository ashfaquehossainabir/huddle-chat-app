import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';
import { activeText } from '../../utils/format.js';

export default function ChatHeader({ chat, title, online, onBack, onOpenMembers, onClearChat }) {
  const isGroup = chat.type === 'group';
  return (
    <header className="chat-head">
      <button className="icon-btn back" onClick={onBack} aria-label="Back to chats"><Icon n="back" size={22} /></button>
      <Avatar name={title} group={isGroup} size={44} online={online} />
      <div className="title">
        <b>{title}</b>
        <span className={online ? 'live' : ''}>{isGroup ? `${chat.group.members.length} members` : `@${chat.user.username} · ${activeText(chat.user.lastActive)}`}</span>
      </div>
      {isGroup
        ? <button className="ghost with-icon" onClick={onOpenMembers} aria-label="Members"><Icon n="users" size={18} /><span className="lbl">Members</span></button>
        : <button className="ghost with-icon" onClick={onClearChat} aria-label="Clear chat"><Icon n="eraser" size={18} /><span className="lbl">Clear chat</span></button>}
    </header>
  );
}
