import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { Navigation } from './components/layout/Navigation';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ExplorePage } from './components/content/ExplorePage';
import { ContentDetail } from './components/content/ContentDetail';
import { CreatorProfile } from './components/creator/CreatorProfile';
import { ContentUpload } from './components/content/ContentUpload';

function App() {
    return (
        <AuthProvider>
            <Router>
                <div className="min-h-screen flex flex-col">
                    <Navigation /> {/* Navigation component */}
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/login" element={<LoginForm />} />
                            <Route path="/signup" element={<SignupForm />} />
                            <Route path="/explore" element={<ExplorePage />} />
                            <Route path="/content/:id" element={<ContentDetail />} />
                            <Route path="/creator/:username" element={<CreatorProfile />} />
                            <Route path="/upload" element={<ContentUpload />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;