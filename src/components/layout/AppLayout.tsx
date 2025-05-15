import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { Navigation } from './Navigation';
import MoreMenu from './MoreMenu';
import { useUI } from '../../contexts/UIContext';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isMoreMenuOpen, closeAllMenus } = useUI();
  
  return (
    <div className="flex h-screen bg-gray-900" onClick={closeAllMenus}>
      {/* Sidebar */}
      <div className="w-64 bg-black border-r border-gray-800">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Navigation />

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4" onClick={(e) => e.stopPropagation()}>
          {children}
        </main>
      </div>

      {/* More Menu Overlay */}
      {isMoreMenuOpen && <MoreMenu />}
    </div>
  );
};

export default AppLayout;
