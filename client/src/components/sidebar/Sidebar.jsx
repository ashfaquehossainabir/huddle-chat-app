import { useState } from 'react';
import Icon from '../ui/Icon.jsx';
import BrandLockup from '../ui/BrandLockup.jsx';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import ProfileRow from './ProfileRow.jsx';
import ConversationTabs from './ConversationTabs.jsx';
import ConversationList from './ConversationList.jsx';

export default function Sidebar({ me, theme, onToggleTheme, data, tab, onTabChange, active, onOpenGroup, onOpenDm, onNew, onSettings, onLogout }) {
  const [q, setQ] = useState('');
  return (
    <aside className="side">
      <div className="side-top">
        <BrandLockup size={30} compact />
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
      <ProfileRow me={me} onSettings={onSettings} onLogout={onLogout} />
      <div className="field-icon filter"><Icon n="search" size={18} /><input placeholder={tab === 'groups' ? 'Search groups' : 'Search chats'} value={q} onChange={e => setQ(e.target.value)} aria-label="Filter conversations" autoCapitalize="none" /></div>
      <ConversationTabs tab={tab} onChange={onTabChange} groupCount={data.groups.length} directCount={data.direct.length} />
      <ConversationList tab={tab} data={data} query={q} active={active} onOpenGroup={onOpenGroup} onOpenDm={onOpenDm} />
      <button className="primary new" onClick={() => onNew(tab)}><Icon n="plus" size={19} strokeWidth={2.4} />{tab === 'groups' ? 'New group' : 'New message'}</button>
    </aside>
  );
}
