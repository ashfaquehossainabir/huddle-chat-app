import Modal from '../ui/Modal.jsx';
import Avatar from '../ui/Avatar.jsx';
import UserPicker from '../ui/UserPicker.jsx';
import { activeText, isOnline } from '../../utils/format.js';

export default function MembersModal({ group, me, isOwner, err, onAdd, onRemove, onClearAll, onLeave, onClose }) {
  return (
    <Modal title={group.name} onClose={onClose}>
      <p className="section-label">{group.members.length} members</p>
      <ul className="results members">
        {group.members.map(u => (
          <li key={u._id} className="member">
            <Avatar name={u.name} size={40} online={u._id === me.id || isOnline(u.lastActive)} />
            <div className="who"><b>{u.name}{String(group.owner) === u._id && <em className="badge">Owner</em>}</b><span>@{u.username} · {u._id === me.id ? 'You' : activeText(u.lastActive)}</span></div>
            {isOwner && u._id !== me.id && <button className="ghost danger" onClick={() => onRemove(u)}>Remove</button>}
          </li>
        ))}
      </ul>
      <p className="section-label">Add people</p>
      <UserPicker placeholder="Add someone by username" exclude={group.members.map(m => m.username)} onPick={onAdd} />
      {err && <div className="error" role="alert">{err}</div>}
      <div className="danger-zone">
        {isOwner && <button className="ghost danger wide" onClick={onClearAll}>Delete all messages</button>}
        <button className="ghost danger wide" onClick={onLeave}>Leave group</button>
      </div>
    </Modal>
  );
}
