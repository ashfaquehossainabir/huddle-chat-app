const PALETTE = [['#0b7a6b', '#fff'], ['#e8735a', '#fff'], ['#f4b942', '#3a2a00'], ['#5566d6', '#fff'], ['#b5479b', '#fff'], ['#238db3', '#fff'], ['#6f8f22', '#fff'], ['#d0526a', '#fff']];

/** Stable [background, foreground] colour pair derived from a name. */
export const tint = name => {
  let h = 0;
  for (const c of String(name || '?')) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
};
