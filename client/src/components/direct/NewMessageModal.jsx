import Modal from '../ui/Modal.jsx';
import UserPicker from '../ui/UserPicker.jsx';

export default function NewMessageModal({ onPick, onClose }) {
  return (
    <Modal title="Message someone" onClose={onClose}>
      <UserPicker placeholder="Search by username" onPick={onPick} />
    </Modal>
  );
}
