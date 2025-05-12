import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { logger } from '../../utils/logger';
import { MenuIcon, UserIcon } from 'lucide-react';
import { DEFAULT_IMAGES } from '../../config/images';

// Constants for configuration
const HEADER_HEIGHT = 'h-16' as const;
const HEADER_CLASSES = 'bg-black border-b border-gray-800 flex items-center px-4' as const;
const DEFAULT_AVATAR = DEFAULT_IMAGES.avatar;

// Interface for menu items
interface HeaderMenuItem {
  label: string;
  onClick: () => void;
  to?: string;
  className: string;
}

// Menu items configuration
const MENU_ITEMS: HeaderMenuItem[] = [
  {
    label: 'Profile',
    onClick: () => {},
    to: '/profile',
    className: 'block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
  },
  {
    label: 'Settings',
    onClick: () => {},
    to: '/settings',
    className: 'block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
  }
];

export function Header({
  className = '',
  onMenuToggle,
}: {
  className?: string;
  onMenuToggle?: () => void;
} = {}) {
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Use a ref to track the previous profile picture URL to prevent unnecessary updates
  const prevProfilePictureRef = React.useRef<string | undefined>();
  
  // Always use the latest user.profilePicture, no need for local state
  const profilePicture = user?.profilePicture || '';
  
  // Debug effect to log profile picture changes
  useEffect(() => {
    if (prevProfilePictureRef.current !== user?.profilePicture) {
      logger.info('Profile picture URL changed', {
        previous: prevProfilePictureRef.current,
        current: user?.profilePicture,
        hasUser: !!user,
        userId: user?.userId
      });
      prevProfilePictureRef.current = user?.profilePicture;
    }
  }, [user?.profilePicture, user?.userId]);

  const handleMenuClick = () => {
    const newState = !isMenuOpen;
    logger.debug(`Menu toggle clicked - new state: ${newState}`);
    setIsMenuOpen(newState);
    onMenuToggle?.();
  };

  return (
    <header className={`${HEADER_HEIGHT} ${HEADER_CLASSES} ${className}`}>
      <div className="flex items-center justify-between w-full">
        <Link to="/" className="text-white text-xl font-bold">
          Sushflix
        </Link>

        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenuClick}
            className="text-gray-400 hover:text-white p-2 rounded"
            aria-label="Toggle menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={handleMenuClick}
                  className="text-gray-400 hover:text-white"
                  aria-label="Toggle user menu"
                >
                  <UserIcon className="w-6 h-6" />
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-lg shadow-lg
                    ${isMenuOpen ? 'block' : 'hidden'}`}
                >
                  <div className="py-2">
                    {MENU_ITEMS.map((item) => (
                      <Link
                        key={item.label}
                        to={item.to || '#'}
                        className={item.className}
                        onClick={handleMenuClick}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-gray-400">{user?.displayName}</span>
                <img
                  src={profilePicture || DEFAULT_AVATAR}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== DEFAULT_AVATAR) {
                      img.src = DEFAULT_AVATAR;
                      logger.warn('Failed to load profile picture, using default', { 
                        attemptedUrl: profilePicture 
                      });
                    }
                  }}
                  key={profilePicture} // Force re-render when profile picture changes
                />
              </div>
            </div>
          ) : (
            <button onClick={() => openAuthModal('login')}>Login</button>
          )}
        </div>
      </div>
    </header>
  );
}
