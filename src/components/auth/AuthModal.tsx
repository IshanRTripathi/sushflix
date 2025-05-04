import React from 'react';
import { useAuth } from './AuthContext';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';
import { Modal } from '../common/Modal';

export function AuthModal() {
  const { 
    isAuthModalOpen, 
    authModalType, 
    closeAuthModal,
    openAuthModal
  } = useAuth();

  return (
    <Modal isOpen={isAuthModalOpen} onClose={closeAuthModal}>
      {authModalType === 'login' ? (
        <LoginForm 
          onClose={closeAuthModal}
          openSignupModal={() => openAuthModal('signup')}
        />
      ) : (
        <SignupForm 
          onClose={closeAuthModal}
        />
      )}
    </Modal>
  );
}
