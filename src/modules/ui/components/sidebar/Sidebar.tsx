import React from 'react';
import { Link } from 'react-router-dom';
import { useUI } from '../../modules/ui/contexts/UIContext';

const Sidebar: React.FC = () => {
  const { closeAllMenus } = useUI();
  return (
    <nav className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-4">
        <h1 className="text-white text-2xl font-bold">Sushflix</h1>
      </div>

      {/* Navigation Links */}
      <div className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link to="/" className="text-white hover:bg-gray-800 p-3 rounded block">
              Home
            </Link>
          </li>
          <li>
            <Link to="/explore" className="text-white hover:bg-gray-800 p-3 rounded block">
              Explore
            </Link>
          </li>
          <li>
            <Link to="/notifications" className="text-white hover:bg-gray-800 p-3 rounded block">
              Notifications
            </Link>
          </li>
          <li>
            <Link to="/messages" className="text-white hover:bg-gray-800 p-3 rounded block">
              Messages
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-4">
        <button 
          className="w-full bg-red-600 hover:bg-red-700 text-white rounded-lg py-2 transition-colors"
          onClick={closeAllMenus}
        >
          Create Post
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
