import Icon from '../ui/Icon.jsx';
import Avatar from '../ui/Avatar.jsx';

export default function ProfileRow({ me, onSettings, onLogout }) {
  return (
    <div className="me-row">
      <Avatar name={me.name} size={42} online />
      <div className="who"><b>{me.name}</b><span>@{me.username}</span></div>
      <button className="icon-btn" onClick={onSettings} aria-label="Account settings" title="Settings"><Icon n="sliders" size={19} /></button>
      <button className="icon-btn" onClick={onLogout} aria-label="Log out" title="Log out"><Icon n="logout" size={19} /></button>
    </div>
  );
}
