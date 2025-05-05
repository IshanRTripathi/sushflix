import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoadingStateProvider } from './contexts/LoadingStateContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ProfileLayout from './components/layout/ProfileLayout';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { ExplorePage } from './components/content/ExplorePage';
import { ContentDetail } from './components/content/ContentDetail';
import SettingsPage from './components/pages/SettingsPage';
import ProfilePage from './components/pages/ProfilePage';
import { AuthModal } from './components/auth/AuthModal';

function App() {
  return (
    <ThemeProvider>
      <LoadingStateProvider>
        <AuthProvider>
          <Router>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/content/:id" element={<ContentDetail />} />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Navigate to="/" />} />
                <Route path="/content/:id" element={
                  <ProtectedRoute>
                    <ContentDetail />
                  </ProtectedRoute>
                } />
                <Route path="/creator/:username" element={
                  <ProtectedRoute>
                    <ProfileLayout />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
          <AuthModal />
          </Router>
        </AuthProvider>
      </LoadingStateProvider>
    </ThemeProvider>
  );
}

export default App;