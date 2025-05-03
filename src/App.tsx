import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
// import { Navigation } from './components/layout/Navigation'; // Removed Navigation
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { ExplorePage } from './components/content/ExplorePage';
import { ContentDetail } from './components/content/ContentDetail';
import { CreatorProfile } from './components/creator/CreatorProfile';

function App() {

    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <div className="min-h-screen flex flex-col">
                        {/* <Navigation /> */}{/* Removed Navigation component */}
                        <main className="flex-grow">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/explore" element={<ExplorePage />} />
                                <Route path="/content/:id" element={<ContentDetail />} />
                                <Route path="/creator/:username" element={<CreatorProfile />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;