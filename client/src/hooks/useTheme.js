import { useState, useEffect, useCallback } from 'react';

const initialTheme = () => localStorage.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme);
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.theme = theme; }, [theme]);
  const toggle = useCallback(() => setTheme(t => (t === 'dark' ? 'light' : 'dark')), []);
  return { theme, toggle };
}
