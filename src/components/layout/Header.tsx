import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoginModal } from '../auth/LoginModal';

export function Header() {
    const { isAuthenticated, logout } = useAuth();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    return (
        <header className="bg-white shadow-md py-4 px-6 md:px-12">
            <div className="flex justify-between items-center">
                {/* Replace logo with text */}
                <span className="text-2xl font-bold text-indigo-600">Sushflix</span>
                <nav className="space-x-6 flex items-center"> 
                    <Link to="#" className="text-gray-600 hover:text-gray-800 text-sm">Platform Guidelines</Link>
                    <Link to="#" className="text-gray-600 hover:text-gray-800 text-sm">About us</Link>
                    <Link to="#" className="text-gray-600 hover:text-gray-800 text-sm">FAQ</Link>
                    <Link to="#" className="text-gray-600 hover:text-gray-800 text-sm">Contact Us</Link>
                    {!isAuthenticated ? (
                        <button 
                            onClick={() => setIsLoginModalOpen(true)} 
                            className="text-gray-600 hover:text-gray-800 text-sm"
                        >
                            Login
                        </button>
                    ) : (
                        <button onClick={logout} className="text-gray-600 hover:text-gray-800 text-sm">Logout</button>
                    )}
                </nav>
            </div>
            <LoginModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />
        </header>
    );
}
