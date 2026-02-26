import React, { useEffect, useState } from 'react';
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

// Hard timeout (ms) before we give up waiting for auth init and show landing page
const AUTH_INIT_TIMEOUT_MS = 5000;

function AppContent() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  // Hard timeout: if auth init takes too long, stop waiting and show landing page
  const [initTimedOut, setInitTimedOut] = useState(false);

  useEffect(() => {
    if (!isInitializing) {
      // Auth resolved normally — no need for timeout
      return;
    }
    const timer = setTimeout(() => {
      setInitTimedOut(true);
    }, AUTH_INIT_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isInitializing]);

  // Reset timeout flag if auth resolves before the timeout fires
  useEffect(() => {
    if (!isInitializing && initTimedOut) {
      setInitTimedOut(false);
    }
  }, [isInitializing, initTimedOut]);

  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched: profileFetched,
    isError: profileError,
    refetch: refetchProfile,
  } = useGetCallerUserProfile();

  // Determine if we're still in the initialization phase
  const authStillInitializing = isInitializing && !initTimedOut;

  // Show loading when:
  // 1. Auth is still initializing (and hasn't timed out)
  // 2. User is authenticated but we haven't finished fetching their profile yet
  const showLoading =
    authStillInitializing ||
    (isAuthenticated && !initTimedOut && (profileLoading || !profileFetched));

  // Only show profile setup when:
  // - authenticated AND profile query is done AND no profile found (or errored = treat as unregistered)
  const showProfileSetup =
    isAuthenticated &&
    !showLoading &&
    (profileFetched && (userProfile === null || profileError));

  // Only show dashboard when authenticated AND profile query is done AND profile exists
  const showDashboard =
    isAuthenticated && !showLoading && profileFetched && userProfile !== null && !profileError;

  // Show landing page when:
  // - NOT authenticated AND (not initializing OR timed out)
  const showLanding = !isAuthenticated && (!isInitializing || initTimedOut);

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
      ) : showLanding ? (
        <LandingPage />
      ) : null}

      {showProfileSetup && (
        <ProfileSetupModal
          open={!!showProfileSetup}
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
