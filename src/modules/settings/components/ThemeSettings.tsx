import React from 'react';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

/**
 * Theme settings section that includes theme toggle and status
 */
export const ThemeSettings: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-medium">Appearance</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Customize how SushFlix looks on your device
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <ThemeToggle showLabel size="md" />
          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {isDark ? 'Dark' : 'Light'} theme
          </span>
        </div>
      </div>
    </div>
  );
};
