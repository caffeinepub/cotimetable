import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, Loader2, Star, ShieldAlert } from 'lucide-react';
import AdminPanel from './AdminPanel';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { login, clear, loginStatus, identity, isLoggingIn } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const [adminOpen, setAdminOpen] = useState(false);

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : '';
        if (msg === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{
          background: 'oklch(0.13 0.05 270 / 0.85)',
          backdropFilter: 'blur(16px)',
          borderColor: 'oklch(0.76 0.14 65 / 0.2)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/assets/generated/logo-icon.dim_128x128.png"
              alt="CoTimetable"
              className="w-8 h-8 rounded-lg shadow-amber"
            />
            <span className="font-display font-bold text-lg tracking-tight">
              <span style={{ color: 'oklch(0.76 0.14 65)' }}>Co</span>
              <span style={{ color: 'oklch(0.84 0.14 88)' }}>Timetable</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Admin panel trigger — subtle icon button */}
            <button
              onClick={() => setAdminOpen(true)}
              title="Admin Panel"
              aria-label="Open admin panel"
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
              style={{
                background: 'oklch(0.76 0.14 65 / 0.06)',
                border: '1px solid oklch(0.76 0.14 65 / 0.12)',
                color: 'oklch(0.55 0.06 270)',
              }}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>

            <Button
              onClick={handleAuth}
              disabled={loginStatus === 'logging-in'}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
              className="gap-2 rounded-full font-medium transition-all duration-200"
              style={
                isAuthenticated
                  ? {
                      borderColor: 'oklch(0.76 0.14 65 / 0.4)',
                      color: 'oklch(0.84 0.14 88)',
                      background: 'oklch(0.76 0.14 65 / 0.1)',
                    }
                  : {
                      background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
                      color: 'oklch(0.12 0.03 270)',
                      border: '1px solid oklch(0.84 0.14 88 / 0.3)',
                    }
              }
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Logging in...
                </>
              ) : isAuthenticated ? (
                <>
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer
        className="border-t py-4 px-4 relative z-10"
        style={{ borderColor: 'oklch(0.76 0.14 65 / 0.15)' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} CoTimetable. All rights reserved.</span>
          <span className="flex items-center gap-1">
            Built with{' '}
            <Star className="w-3 h-3 fill-current" style={{ color: 'oklch(0.84 0.14 88)' }} />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'cotimetable')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors hover:opacity-80"
              style={{ color: 'oklch(0.76 0.14 65)' }}
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>

      {/* Admin Panel Dialog */}
      <AdminPanel open={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}
