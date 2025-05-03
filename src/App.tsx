import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
// import { Navigation } from './components/layout/Navigation'; // Removed Navigation
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { ExplorePage } from './components/content/ExplorePage';
import { ContentDetail } from './components/content/ContentDetail';
import { CreatorProfile } from './components/creator/CreatorProfile';
import UserProfilePage from './components/UserProfilePage';

// Wrapper component to extract username from URL
const UserProfilePageWrapper = () => {
  const { username } = useParams<{ username: string }>();
  return username ? <UserProfilePage username={username} /> : null;
};

function App() {

    return (
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
                            <Route path="/:username" element={<UserProfilePageWrapper />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </AuthProvider>
    );
}

export default App;