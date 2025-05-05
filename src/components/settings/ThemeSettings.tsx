import { useTheme } from '../../contexts/ThemeContext';

export const ThemeSettings = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Theme</h3>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors"
          style={{ backgroundColor: theme === 'light' ? 'var(--hover-bg)' : 'var(--bg-color)' }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
            />
          </svg>
          <span>Dark Mode</span>
        </button>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {theme === 'dark' ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  );
};
