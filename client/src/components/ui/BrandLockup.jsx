import Mark from './Mark.jsx';

export default function BrandLockup({ size = 34, compact }) {
  return <div className={'brand-lockup' + (compact ? ' compact' : '')}><Mark size={size} /><span>Huddle</span></div>;
}
