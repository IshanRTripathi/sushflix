import React from 'react';
import { useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Modal } from '../common/Modal';
import { logger } from '../../utils/logger';

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
      aria-labelledby="auth-modal-title"
    >
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
    </Modal>
  );
};