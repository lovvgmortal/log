import React from 'react';
import { useThemeStore } from '../store/themeStore';
import { SunIcon, MoonIcon } from './Icons';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-700/50 border border-white/10 transition-all duration-200 group"
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <SunIcon className="w-5 h-5 text-yellow-400 group-hover:rotate-90 transition-transform duration-300" />
            ) : (
                <MoonIcon className="w-5 h-5 text-indigo-400 group-hover:-rotate-12 transition-transform duration-300" />
            )}
        </button>
    );
};
