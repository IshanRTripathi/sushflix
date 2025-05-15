import React, { createContext, useContext, useState, useCallback } from 'react';

interface UIContextType {
  // Navigation
  isSidebarOpen: boolean;
  isMoreMenuOpen: boolean;
  isMobileMenuOpen: boolean;
  
  // Actions
  toggleSidebar: () => void;
  toggleMoreMenu: () => void;
  toggleMobileMenu: () => void;
  closeAllMenus: () => void;
  openMoreMenu: () => void;
  closeMoreMenu: () => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const toggleMoreMenu = useCallback(() => {
    setIsMoreMenuOpen(prev => !prev);
  }, []);

  const openMoreMenu = useCallback(() => {
    setIsMoreMenuOpen(true);
  }, []);

  const closeMoreMenu = useCallback(() => {
    setIsMoreMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeAllMenus = useCallback(() => {
    setIsMoreMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <UIContext.Provider
      value={{
        isSidebarOpen,
        isMoreMenuOpen,
        isMobileMenuOpen,
        toggleSidebar,
        toggleMoreMenu,
        toggleMobileMenu,
        closeAllMenus,
        openMoreMenu,
        closeMoreMenu,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextType => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
