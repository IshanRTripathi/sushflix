import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { ExplorePage } from './components/content/ExplorePage';
import { ContentDetail } from './components/content/ContentDetail';
import ProfileLayout from './components/layout/ProfileLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <main className="flex-grow">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<HomePage />} />
                <Route path="/signup" element={<HomePage />} />
                
                {/* Protected routes */}
                <Route path="/" element={<Navigate to="/explore" replace />} />
                <Route path="/explore" element={
                  <ProtectedRoute>
                    <ExplorePage />
                  </ProtectedRoute>
                } />
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