import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/auth/AuthContext';
import { ThemeProvider } from './theme/components/ThemeProvider';
import { LoadingProvider } from './contexts/LoadingContext';
import { UIProvider } from './contexts/UIContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ProfileLayout from './components/layout/ProfileLayout';
import { Footer } from './components/layout/Footer';
import Toast from './components/Toast';
import HomePage from './components/pages/HomePage';
import { ExplorePage } from './components/content/ExplorePage';
import { ContentDetail } from './components/content/components/ContentDetail';
import SettingsPage from './components/pages/SettingsPage';
import ProfilePage from './components/pages/ProfilePage';
import { AuthModal } from './components/auth/AuthModal';
import { Navigation } from './components/layout/Navigation';

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1,
      },
    },
  });

  return (
    <ThemeProvider>
      <UIProvider>
        <LoadingProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <div className="min-h-screen flex flex-col">
                <Navigation />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/explore" element={<ExplorePage />} />
                    <Route path="/content/:id" element={
                      <ProtectedRoute>
                        <ContentDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="/profile/:username" element={
                      <ProtectedRoute publicPath="/profile/:username">
                        <ProfilePage />
                      </ProtectedRoute>
                    } />
                    <Route path="/settings" element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    } />
                    <Route path="/login" element={<Navigate to="/" />} />
                    <Route path="/creator/:username" element={
                      <ProtectedRoute>
                        <ProfileLayout />
                      </ProtectedRoute>
                    } />
                  </Routes>
                </main>
                <Footer />
              </div>
              <AuthModal />
              <Toast />
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </LoadingProvider>
      </UIProvider>
    </ThemeProvider>
  );
}

export default App;
