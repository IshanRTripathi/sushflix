import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { logger } from '../../utils/logger';
import { DEFAULT_IMAGES } from '../../config/images';

const HEADER_HEIGHT = 'h-16' as const;
const HEADER_CLASSES = 'bg-black border-b border-gray-800 flex items-center px-4' as const;
const DEFAULT_AVATAR = DEFAULT_IMAGES.avatar;

interface HeaderMenuItem {
  label: string;
  onClick: () => void;
  to?: string;
  className: string;
}

const MENU_ITEMS: HeaderMenuItem[] = [
  {
    label: 'Explore',
    onClick: () => {},
    to: '/explore',
    className: 'block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800'
  },
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
  closeOnOutsideClick = true,
}: {
  className?: string;
  onMenuToggle?: () => void;
  closeOnOutsideClick?: boolean;
} = {}) {
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const prevProfilePictureRef = useRef<string | undefined>();
  const profilePicture = user?.profilePicture || '';

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

  // Handle clicks outside the menu to close it
  useEffect(() => {
    if (!isMenuOpen || !closeOnOutsideClick) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        logger.debug('Clicked outside menu, closing it');
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, closeOnOutsideClick]);

  return (
    <header
      className={`${HEADER_HEIGHT} ${HEADER_CLASSES} ${className}`}
      style={{ position: 'relative', zIndex: 100 }}
    >
      <div className="flex items-center justify-between w-full">
        <Link to="/" className="text-red-600 hover:text-red-500 text-2xl font-bold transition-colors">
          Sushflix
        </Link>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={handleMenuClick}
                className="flex items-center space-x-2 focus:outline-none"
                aria-label="Toggle user menu"
              >
                <span className="text-gray-300">{user?.displayName}</span>
                <img
                  src={profilePicture || DEFAULT_AVATAR}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-transparent hover:border-red-500 transition-colors"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    if (img.src !== DEFAULT_AVATAR) {
                      img.src = DEFAULT_AVATAR;
                      logger.warn('Failed to load profile picture, using default', {
                        attemptedUrl: profilePicture
                      });
                    }
                  }}
                  key={profilePicture}
                />
              </button>

              <div
                className={`absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-lg shadow-lg z-50 ${
                  isMenuOpen ? 'block' : 'hidden'
                }`}
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
          ) : (
            <button onClick={() => openAuthModal('login')}>Login</button>
          )}
        </div>
      </div>
    </header>
  );
}
