import React, { useEffect, useState } from 'react';

export const DarkModeToggle: React.FC = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (dark) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded border border-gray-500 hover:bg-gray-700 text-gray-200"
    >
      {dark ? 'Light Mode' : 'Dark Mode'}
    </button>
  );
};
