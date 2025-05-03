import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Header } from './Header';
import MoreMenu from './MoreMenu';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  
  return (
    <div className="flex h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-gray-800">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header onMoreClick={() => setIsMoreMenuOpen(true)} />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4">
          {children}
        </main>
      </div>

      {/* More Menu Overlay */}
      {isMoreMenuOpen && (
        <MoreMenu onClose={() => setIsMoreMenuOpen(false)} />
      )}
    </div>
  );
};

export default AppLayout;
