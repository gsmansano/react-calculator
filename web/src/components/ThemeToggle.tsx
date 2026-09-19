import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const prefersDark = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
    const isDarkMode = document.documentElement.classList.contains('dark') || prefersDark;
    setIsDark(isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-3 rounded-full bg-slate-200/50 dark:bg-slate-800/50 text-[#0c1010] dark:text-[#f0f4f4] transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#7c9899] shadow-sm"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-500" />}
    </button>
  );
};
