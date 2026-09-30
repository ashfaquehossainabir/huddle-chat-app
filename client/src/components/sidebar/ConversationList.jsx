import Avatar from '../ui/Avatar.jsx';
import { activeText, isOnline } from '../../utils/format.js';

export default function ConversationList({ tab, data, query, active, onOpenGroup, onOpenDm }) {
  const needle = query.trim().toLowerCase();
  const groups = data.groups.filter(g => !needle || g.name.toLowerCase().includes(needle));
  const direct = data.direct.filter(u => !needle || u.name.toLowerCase().includes(needle) || u.username.toLowerCase().includes(needle));
  const noMatch = needle && ((tab === 'groups' && data.groups.length && !groups.length) || (tab === 'direct' && data.direct.length && !direct.length));

  return (
    <ul className="list">
      {tab === 'groups' && groups.map(g => (
        <li key={g._id}><button className={active?.type === 'group' && active.group.id === g._id ? 'on' : ''} onClick={() => onOpenGroup(g)}>
          <Avatar name={g.name} group size={46} /><span className="who"><b>{g.name}</b><span>{g.members.length} members</span></span></button></li>
      ))}
      {tab === 'direct' && direct.map(u => (
        <li key={u.id}><button className={active?.type === 'dm' && active.user.username === u.username ? 'on' : ''} onClick={() => onOpenDm(u)}>
          <Avatar name={u.name} size={46} online={isOnline(u.lastActive)} /><span className="who"><b>{u.name}</b><span>{activeText(u.lastActive)}</span></span></button></li>
      ))}
      {tab === 'groups' && !data.groups.length && <li className="hint">You haven’t joined any groups. Create one to start.</li>}
      {tab === 'direct' && !data.direct.length && <li className="hint">No conversations yet. Search a username to message someone.</li>}
      {noMatch && <li className="hint">Nothing matches “{query}”.</li>}
    </ul>
  );
}
