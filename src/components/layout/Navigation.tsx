import { useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../modules/auth/context/AuthContext';
import { useTheme } from '../../theme/hooks/useTheme';
import { DEFAULT_IMAGES } from '../../config/images';
import { useUI } from '../../contexts/UIContext';

export function Navigation() {
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const { isDark } = useTheme();
  const { isMobileMenuOpen, toggleMobileMenu } = useUI();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = useCallback(() => {
    logout();
    toggleMobileMenu();
  }, [logout, toggleMobileMenu]);

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        toggleMobileMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [toggleMobileMenu]);

  return (
    <nav className={`h-16 ${isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-white shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className={`text-xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Sushflix
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="hidden md:flex space-x-1">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Home
              </Link>
              <Link 
                to="/explore" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Explore
              </Link>
              <Link 
                to={`/profile/${user?.username}`} 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Profile
              </Link>
              <Link 
                to="/settings" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isDark 
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Settings
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="relative flex items-center">
                <button
                  onClick={toggleMobileMenu}
                  className="focus:outline-none"
                  aria-label="Toggle user menu"
                  aria-expanded={isMobileMenuOpen}
                >
                  <img
                    src={user?.profilePicture || DEFAULT_IMAGES.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:border-indigo-500 transition-colors"
                  />
                </button>

                {isMobileMenuOpen && (
                  <div className={`absolute top-full right-4 mt-2 w-48 rounded-md shadow-lg z-50 ${isDark ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'}`} ref={menuRef}>
                    <div className="py-1">
                      <Link
                        to={`/profile/${user?.username}`}
                        className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={toggleMobileMenu}
                      >
                        Your Profile
                      </Link>
                      <Link
                        to={`/explore`}
                        className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={toggleMobileMenu}
                      >
                        Explore
                      </Link>
                      <Link
                        to="/settings"
                        className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={toggleMobileMenu}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className={`block w-full text-left px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        <svg className="w-4 h-4 mr-2 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => openAuthModal('login')} className="text-gray-400 hover:text-gray-500">
                Login
              </button>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
}
