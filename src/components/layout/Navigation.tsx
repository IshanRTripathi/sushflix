import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function Navigation() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  return (
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Sushflix</span>
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                    to="/explore"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Explore
                </Link>
                {isAuthenticated && user?.isCreator && (
                    <Link
                        to="/upload"
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                    >
                      Upload
                    </Link>
                )}
                <Link
                    to="/subscribe"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                >
                  Subscribe
                </Link>
              </div>
            </div>

            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              {isAuthenticated && user ? (
                  <div className="flex items-center space-x-4">
                    <Link
                        to={`/creator/${user.username}`}
                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
                    >
                      <User className="w-5 h-5" />
                      <span>{user.username}</span>
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 text-gray-700 hover:text-indigo-600"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
              ) : (
                  <div className="flex items-center space-x-4">
                    <Link
                        to="/login"
                        className="text-gray-700 hover:text-indigo-600"
                    >
                      Login
                    </Link>
                    <Link
                        to="/signup"
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                      Sign Up
                    </Link>
                  </div>
              )}
            </div>

            <div className="flex items-center sm:hidden">
              <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600"
              >
                {isMenuOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
            <div className="sm:hidden">
              <div className="pt-2 pb-3 space-y-1">
                <Link
                    to="/explore"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                >
                  Explore
                </Link>
                {isAuthenticated && user?.isCreator && (
                    <Link
                        to="/upload"
                        className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsMenuOpen(false)}
                    >
                      Upload
                    </Link>
                )}
                <Link
                    to="/subscribe"
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                    onClick={() => setIsMenuOpen(false)}
                >
                  Subscribe
                </Link>
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isAuthenticated && user ? (
                    <div className="space-y-1">
                      <Link
                          to={`/creator/${user.username}`}
                          className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      <button
                          onClick={handleLogout}
                          className="block w-full text-left pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Logout
                      </button>
                    </div>
                ) : (
                    <div className="space-y-1">
                      <Link
                          to="/login"
                          className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                          to="/signup"
                          className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMenuOpen(false)}
                      >
                        Sign Up
                      </Link>
                    </div>
                )}
              </div>
            </div>
        )}
      </nav>
  );
}