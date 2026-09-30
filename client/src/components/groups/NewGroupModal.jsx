import { useState } from 'react';
import { api } from '../../api/client.js';
import Modal from '../ui/Modal.jsx';
import Icon from '../ui/Icon.jsx';
import UserPicker from '../ui/UserPicker.jsx';

export default function NewGroupModal({ onDone, onClose }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState([]);
  const [err, setErr] = useState('');

  const create = async () => {
    try { onDone(await api('/groups', 'POST', { name, members: members.map(m => m.username) })); }
    catch (x) { setErr(x.message); }
  };

  return (
    <Modal title="Create a group" onClose={onClose}>
      <label className="fld">Group name<input placeholder="Weekend plans" value={name} onChange={e => setName(e.target.value)} maxLength={60} /></label>
      {members.length > 0 && (
        <div className="chips">
          {members.map(m => (
            <button key={m.id} className="chip" onClick={() => setMembers(members.filter(x => x.id !== m.id))} aria-label={`Remove @${m.username}`}>@{m.username}<Icon n="x" size={13} /></button>
          ))}
        </div>
      )}
      <UserPicker placeholder="Search username to add" exclude={members.map(m => m.username)} onPick={u => setMembers([...members, u])} />
      {err && <div className="error" role="alert">{err}</div>}
      <button className="primary block" disabled={!name.trim()} onClick={create}>Create group</button>
    </Modal>
  );
}
