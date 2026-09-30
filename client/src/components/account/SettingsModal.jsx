import Modal from '../ui/Modal.jsx';
import Avatar from '../ui/Avatar.jsx';
import ProfileForm from './ProfileForm.jsx';
import PasswordForm from './PasswordForm.jsx';

export default function SettingsModal({ me, onSaved, onClose }) {
  return (
    <Modal title="Account settings" onClose={onClose} wide>
      <div className="me-card"><Avatar name={me.name} size={52} /><div className="who"><b>{me.name}</b><span>@{me.username}</span></div></div>
      <ProfileForm me={me} onSaved={onSaved} />
      <PasswordForm />
    </Modal>
  );
}
