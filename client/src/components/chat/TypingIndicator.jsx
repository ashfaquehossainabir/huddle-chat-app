export default function TypingIndicator({ typers }) {
  if (!typers.length) return null;
  return (
    <div className="typing" aria-live="polite">
      <span className="dots"><i /><i /><i /></span>
      {typers.join(', ')} {typers.length > 1 ? 'are' : 'is'} typing…
    </div>
  );
}
