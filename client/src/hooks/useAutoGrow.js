import { useEffect } from 'react';

/**
 * Grows a textarea with its content up to `max` px. The scrollbar only appears once the max is
 * reached, and the border is included in the height so a single line never triggers a scrollbar.
 */
export function useAutoGrow(ref, value, max = 140) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    const border = el.offsetHeight - el.clientHeight;
    const h = el.scrollHeight + border;
    el.style.height = Math.min(h, max) + 'px';
    el.style.overflowY = h > max ? 'auto' : 'hidden';
  }, [value, max]);
}
