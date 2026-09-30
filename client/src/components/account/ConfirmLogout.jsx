import Modal from '../ui/Modal.jsx';

export default function ConfirmLogout({ onConfirm, onClose }) {
  return (
    <Modal title="Log out?" onClose={onClose}>
      <p className="hint confirm-text">Are you sure you want to log out of Huddle?</p>
      <div className="actions">
        <button className="ghost" onClick={onClose}>Cancel</button>
        <button className="primary" onClick={onConfirm}>Log out</button>
      </div>
    </Modal>
  );
}
