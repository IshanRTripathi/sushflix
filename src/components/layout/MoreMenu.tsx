import React, { useCallback } from 'react';
import { logger } from '../../utils/logger';
import { SettingsIcon, HelpCircleIcon, ShieldIcon, FileTextIcon } from 'lucide-react';

// Constants for configuration
const MENU_ITEMS = [
  {
    id: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    path: '/settings',
    action: () => logger.info('Settings clicked')
  },
  {
    id: 'help',
    label: 'Help Center',
    icon: HelpCircleIcon,
    path: '/help',
    action: () => logger.info('Help Center clicked')
  },
  {
    id: 'privacy',
    label: 'Privacy Policy',
    icon: ShieldIcon,
    path: '/privacy',
    action: () => logger.info('Privacy Policy clicked')
  },
  {
    id: 'terms',
    label: 'Terms of Service',
    icon: FileTextIcon,
    path: '/terms',
    action: () => logger.info('Terms of Service clicked')
  }
] as const;

interface MoreMenuProps {
  onClose: () => void;
  className?: string;
  onMenuItemClick?: (id: string) => void;
}

export const MoreMenu: React.FC<MoreMenuProps> = ({
  onClose,
  className = '',
  onMenuItemClick
}) => {
  const handleItemClick = useCallback((id: string) => {
    try {
      const item = MENU_ITEMS.find(i => i.id === id);
      if (item) {
        item.action();
        onMenuItemClick?.(id);
        onClose();
      }
    } catch (error: unknown) {
      logger.error('Error handling menu item click:', {
        error: error as Error,
        itemId: id
      });
    }
  }, [onClose, onMenuItemClick]);

  const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="more-menu-title"
    >
      <div className="bg-black w-64 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <h2
            id="more-menu-title"
            className="text-white text-lg font-semibold mb-4"
          >
            More Options
          </h2>
          
          <div className="space-y-2">
            {MENU_ITEMS.map((item) => (
              <button
                key={item.id}
                className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded flex items-center gap-2"
                onClick={() => handleItemClick(item.id)}
                aria-label={item.label}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreMenu;
