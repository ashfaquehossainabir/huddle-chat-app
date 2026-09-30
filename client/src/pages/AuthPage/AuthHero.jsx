import Avatar from '../../components/ui/Avatar.jsx';
import BrandLockup from '../../components/ui/BrandLockup.jsx';

/** Decorative marketing panel shown beside the login/signup form. */
export default function AuthHero() {
  return (
    <section className="auth-hero" aria-hidden="true">
      <BrandLockup size={46} />
      <h2>Your people,<br />one tap away.</h2>
      <p>Message friends one-to-one or gather a group. Find anyone by username.</p>
      <div className="preview">
        <div className="pv-row"><Avatar name="Maya" size={34} /><div className="pv-bubble in">Are we still on for Friday?</div></div>
        <div className="pv-row me"><div className="pv-bubble out">Yes! I’ll bring the snacks.</div></div>
        <div className="pv-row"><Avatar name="Jonas" size={34} /><div className="pv-bubble in typing-b"><i /><i /><i /></div></div>
      </div>
    </section>
  );
}
