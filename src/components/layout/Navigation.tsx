import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../../config';
import { DEFAULT_IMAGES } from '../../config/images';

export function Navigation() {
  const { isAuthenticated, logout, user, openAuthModal } = useAuth();
  const { isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
    <nav className={`h-16 ${isDark ? 'bg-gray-900 border-b border-gray-800' : 'bg-white shadow-lg'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className={`text-xl font-bold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                Sushflix
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
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
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-1 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`p-1 rounded-full ${isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg ${isDark ? 'bg-gray-800 ring-1 ring-gray-700' : 'bg-white ring-1 ring-black ring-opacity-5'}`}>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Your Profile
                        </Link>
                        <Link
                          to="/settings"
                          className={`block px-4 py-2 text-sm ${isDark ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'}`}
                          onClick={() => setIsMenuOpen(false)}
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

                <div className="flex items-center space-x-2">
                  <span className="text-gray-400">{user?.displayName}</span>
                  <img
                    src={user?.profilePicture || DEFAULT_IMAGES.avatar}
                    alt="Profile"
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              </div>
            ) : (
              <button onClick={() => openAuthModal('login')} className="text-gray-400 hover:text-gray-500">
                Login
              </button>
            )}
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Home
            </Link>
            <Link
              to="/explore"
              className={`block px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-50'}`}
            >
              Explore
            </Link>
          </div>
          {isAuthenticated ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="flex-shrink-0">
                  <img
                    className="h-10 w-10 rounded-full"
                    src={user?.profilePicture || DEFAULT_IMAGES.avatar}
                    alt="Profile"
                  />
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">
                    {user?.displayName}
                  </div>
                </div>
              </div>
              <div className="mt-3 px-2 space-y-1">
                <Link
                  to={`/profile/${user?.username}`}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className={`block px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  Settings
                </Link>
                <button
                  onClick={handleLogout}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-900 hover:text-gray-700 hover:bg-gray-50'}`}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3">
              <div className="px-5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="text-gray-400 hover:text-gray-500"
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
