import React from 'react';
import { useAuth } from '../auth/AuthContext';

export function Header() {
    const { isAuthenticated, logout } = useAuth();

    return (
        <header>
            <nav>
                <ul>
                    {/* Other Nav items */}
                    {!isAuthenticated ? (
                        <>
                            <li><a href="/login">Login</a></li>
                            <li><a href="/signup">Signup</a></li>
                        </>
                    ) : (
                        <li><button onClick={logout}>Logout</button></li>
                    )}
                </ul>
            </nav>
        </header>
    );
}