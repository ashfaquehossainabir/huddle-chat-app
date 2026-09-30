import Icon from './Icon.jsx';

export default function ThemeToggle({ theme, onToggle, className = '' }) {
  const dark = theme === 'dark';
  return (
    <button type="button" className={'icon-btn ' + className} onClick={onToggle} aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'} title={dark ? 'Light mode' : 'Dark mode'}>
      <Icon n={dark ? 'sun' : 'moon'} size={19} />
    </button>
  );
}
