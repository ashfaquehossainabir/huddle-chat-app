/** Presence + date/time formatting helpers. */
export const activeText = d => {
  if (!d) return '';
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 1) return 'Active now';
  if (m < 60) return `Active ${m} minute${m > 1 ? 's' : ''} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Active ${h} hour${h > 1 ? 's' : ''} ago`;
  const days = Math.floor(h / 24);
  return `Active ${days} day${days > 1 ? 's' : ''} ago`;
};

export const isOnline = d => !!d && Date.now() - new Date(d) < 120000;

export const timeOf = d => new Date(d).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

export const dayKey = d => new Date(d).toDateString();

export const dayLabel = d => {
  const date = new Date(d), today = new Date(), y = new Date();
  y.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return 'Today';
  if (date.toDateString() === y.toDateString()) return 'Yesterday';
  return date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', ...(date.getFullYear() !== today.getFullYear() && { year: 'numeric' }) });
};
