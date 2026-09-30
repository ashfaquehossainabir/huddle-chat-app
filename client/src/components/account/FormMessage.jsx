export default function FormMessage({ msg }) {
  return msg ? <div className={msg.ok ? 'ok' : 'error'} role="status">{msg.text}</div> : null;
}
