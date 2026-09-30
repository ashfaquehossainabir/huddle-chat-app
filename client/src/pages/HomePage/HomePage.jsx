import { useState } from 'react';
import { useConversations } from '../../hooks/useConversations.js';
import Sidebar from '../../components/sidebar/Sidebar.jsx';
import Chat from '../../components/chat/Chat.jsx';
import SettingsModal from '../../components/account/SettingsModal.jsx';
import ConfirmLogout from '../../components/account/ConfirmLogout.jsx';
import NewGroupModal from '../../components/groups/NewGroupModal.jsx';
import NewMessageModal from '../../components/direct/NewMessageModal.jsx';
import EmptyState from './EmptyState.jsx';

/** Main messenger screen for a signed-in user: sidebar, open conversation and modals. */
export default function HomePage({ me, onMeChange, onLogout, theme, onToggleTheme }) {
  const convo = useConversations(me);
  const [modal, setModal] = useState(null); // 'settings' | 'logout' | 'groups' | 'direct' | null
  const closeModal = () => setModal(null);

  const { active, liveChat } = convo;
  const pickDm = u => { convo.openDm(u); closeModal(); };
  const confirmLogout = () => { closeModal(); onLogout(); };

  return (
    <div className={'app ' + (active ? 'chat-open' : '')}>
      <Sidebar
        me={me}
        theme={theme}
        onToggleTheme={onToggleTheme}
        data={convo.data}
        tab={convo.tab}
        onTabChange={convo.setTab}
        active={active}
        onOpenGroup={convo.openGroup}
        onOpenDm={pickDm}
        onNew={setModal}
        onSettings={() => setModal('settings')}
        onLogout={() => setModal('logout')}
      />
      <main>
        {active
          ? <Chat key={active.type + (active.group?._id || active.user?.username)} chat={liveChat} me={me} onBack={convo.closeChat} onLeave={convo.leaveChat} onGroupUpdate={convo.onGroupUpdate} />
          : <EmptyState />}
      </main>
      {modal === 'settings' && <SettingsModal me={me} onSaved={onMeChange} onClose={closeModal} />}
      {modal === 'logout' && <ConfirmLogout onClose={closeModal} onConfirm={confirmLogout} />}
      {modal === 'groups' && <NewGroupModal onClose={closeModal} onDone={g => { closeModal(); convo.refresh(); convo.openGroup(g); }} />}
      {modal === 'direct' && <NewMessageModal onClose={closeModal} onPick={pickDm} />}
    </div>
  );
}
