import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProfileSetupModal from './components/ProfileSetupModal';
import AnimatedSkyBackground from './components/AnimatedSkyBackground';
import MusicToggleButton from './components/MusicToggleButton';
import { Loader2 } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
});

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  const showDashboard =
    isAuthenticated && !profileLoading && profileFetched && userProfile !== null;

  const showLoading = isInitializing || (isAuthenticated && profileLoading);

  return (
    <Layout>
      {/* Persistent sky background for all authenticated views */}
      {isAuthenticated && <AnimatedSkyBackground />}

      {showLoading ? (
        <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: 'oklch(0.76 0.14 65 / 0.15)',
                border: '1px solid oklch(0.76 0.14 65 / 0.3)',
                boxShadow: '0 0 24px oklch(0.76 0.14 65 / 0.2)',
              }}
            >
              <Loader2
                className="w-7 h-7 animate-spin"
                style={{ color: 'oklch(0.76 0.14 65)' }}
              />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Loading your journey...</p>
          </div>
        </div>
      ) : showDashboard ? (
        <Dashboard myProfile={userProfile!} />
      ) : (
        <LandingPage />
      )}

      {showProfileSetup && (
        <ProfileSetupModal
          open={showProfileSetup}
          onComplete={() => refetchProfile()}
        />
      )}

      {/* Persistent ambient music toggle — visible on all screens */}
      <MusicToggleButton />
    </Layout>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} forcedTheme="dark">
        <AppContent />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
