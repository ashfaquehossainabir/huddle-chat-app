export default function ConversationTabs({ tab, onChange, groupCount, directCount }) {
  return (
    <nav className="tabs" role="tablist">
      <button role="tab" aria-selected={tab === 'groups'} className={tab === 'groups' ? 'on' : ''} onClick={() => onChange('groups')}>Groups<em>{groupCount}</em></button>
      <button role="tab" aria-selected={tab === 'direct'} className={tab === 'direct' ? 'on' : ''} onClick={() => onChange('direct')}>Direct<em>{directCount}</em></button>
    </nav>
  );
}
