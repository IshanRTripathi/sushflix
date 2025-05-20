import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './modules/auth/context/AuthContext';
import { ThemeProvider } from './modules/settings/components/ThemeProvider';
import { LoadingProvider } from './modules/ui/contexts/LoadingContext';
import { UIProvider } from './modules/ui/contexts/UIContext';
import { ProtectedRoute } from './modules/auth/components/ProtectedRoute';
import ProfileLayout from './modules/profile/components/profile/ProfileLayout';
import { Footer } from './modules/ui/components/footer/Footer';
import Toast from './modules/ui/components/Toast';
import HomePage from './modules/ui/components/home/HomePage';
import { ExplorePage } from './modules/creator/components/content/ExplorePage';
import { ContentDetail } from './modules/creator/components/content/ContentDetail';
import SettingsPage from './modules/settings/components/SettingsPage';
import ProfilePage from './modules/profile/components/ProfilePage';
import { AuthModal } from './modules/auth/components/AuthModal';
import { Navigation } from './modules/ui/components/header/Navigation';

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
