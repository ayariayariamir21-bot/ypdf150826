import { useCallback, useEffect, useState } from 'react';

function getInitialDark(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }
  const stored = window.localStorage.getItem('ypdf-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored === 'dark';
  }
  return true;
}

export function useDarkMode(): { isDark: boolean; toggle: () => void } {
  const [isDark, setIsDark] = useState<boolean>(getInitialDark);

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    window.localStorage.setItem('ypdf-theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const toggle = useCallback(() => {
    setIsDark((current) => !current);
  }, []);

  return { isDark, toggle };
}
