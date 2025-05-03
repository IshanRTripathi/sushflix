import React from 'react';
import Link from 'next/link';

const Sidebar = () => {
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
            <Link href="/" className="text-white hover:bg-gray-800 p-3 rounded">
              Home
            </Link>
          </li>
          <li>
            <Link href="/explore" className="text-white hover:bg-gray-800 p-3 rounded">
              Explore
            </Link>
          </li>
          <li>
            <Link href="/notifications" className="text-white hover:bg-gray-800 p-3 rounded">
              Notifications
            </Link>
          </li>
          <li>
            <Link href="/messages" className="text-white hover:bg-gray-800 p-3 rounded">
              Messages
            </Link>
          </li>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className="mt-auto p-4">
        <button className="w-full bg-red-600 text-white rounded-lg py-2">
          Create Post
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;
