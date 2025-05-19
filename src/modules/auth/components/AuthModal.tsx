// Authentication modal component for login and signup
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Modal } from '../../../components/common/Modal';
import { logger } from '../../../utils/logger';

/**
 * Authentication modal component
 */
export const AuthModal = () => {
  const { 
    isAuthModalOpen, 
    authModalType, 
    closeAuthModal, 
    openAuthModal 
  } = useAuth();

  React.useEffect(() => {
    if (isAuthModalOpen) {
      logger.debug('Auth modal opened', { 
        modalType: authModalType
      });
    }
  }, [isAuthModalOpen, authModalType]);

  return (
    <Modal 
      isOpen={isAuthModalOpen} 
      onClose={closeAuthModal}
    >
      <div className="auth-modal-content">
        <h2 id="auth-modal-title" className="sr-only">
          {authModalType === 'login' ? 'Login' : 'Sign Up'}
        </h2>
        {authModalType === 'login' ? (
          <LoginForm 
            onClose={closeAuthModal} 
            openSignupModal={() => openAuthModal('signup')}
          />
        ) : (
          <SignupForm 
            onClose={closeAuthModal} 
            openLoginModal={() => openAuthModal('login')}
          />
        )}
      </div>
    </Modal>
  );
};