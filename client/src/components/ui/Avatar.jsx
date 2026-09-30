import { tint } from '../../utils/avatarColor.js';

export default function Avatar({ name = '?', group, size = 44, online }) {
  const [bg, fg] = tint(name);
  return (
    <span className={'avatar' + (group ? ' is-group' : '')} style={{ '--sz': size + 'px', '--av': bg, '--avfg': fg }} aria-hidden="true">
      {(name[0] || '?').toUpperCase()}
      {online && <i className="dot" />}
    </span>
  );
}
