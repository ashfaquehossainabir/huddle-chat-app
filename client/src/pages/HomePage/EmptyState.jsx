import Mark from '../../components/ui/Mark.jsx';

export default function EmptyState() {
  return (
    <div className="empty">
      <div className="empty-art" aria-hidden="true"><Mark size={92} /></div>
      <h2>Pick a conversation</h2>
      <p>Choose a group or a direct chat from the sidebar, or start a new one.</p>
    </div>
  );
}
