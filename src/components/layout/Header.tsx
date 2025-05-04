import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginForm } from '../auth/LoginForm';
import ThemeToggle from '../ui/ThemeToggle';
import { logger } from '../../utils/logger';

export function Header() {
  const { isAuthenticated, logout, user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    logger.info('Header component mounted');
  }, []);

  const handleMenuClick = () => {
    const newState = !isMenuOpen;
    logger.debug(`Menu toggle clicked - new state: ${newState}`);
    setIsMenuOpen(newState);
  };

  return (
    <header className="h-16 bg-black border-b border-gray-800 flex items-center px-4">
      <div className="flex items-center justify-between w-full">
        <Link to="/" className="text-white text-xl font-bold">
          Sushflix
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-400 hover:text-white p-2 rounded"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-black border border-gray-800 rounded-lg shadow-lg
                    ${isMenuOpen ? 'block' : 'hidden'}`}
                >
                  <div className="py-2">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={handleMenuClick}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="block px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={handleMenuClick}
                    >
                      Settings
                    </Link>
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
                  src={user?.profilePicture || '/default-avatar.png'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginModalOpen(true)} 
              className="text-gray-400 hover:text-white"
            >
              Login
            </button>
          )}
        </div>
      </div>

      <LoginForm 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
      />
    </header>
  );
}
