import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn, Clock, MessageSquare, Calendar, Loader2, Star } from 'lucide-react';
import AnimatedSkyBackground from '../components/AnimatedSkyBackground';

export default function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';

  const handleEnter = async () => {
    try {
      await login();
    } catch (error: unknown) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Animated Sky Background */}
      <AnimatedSkyBackground />

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-16 pb-12 px-4 text-center">
        {/* Logo glow */}
        <div className="mb-6 relative">
          <div
            className="absolute inset-0 rounded-full blur-2xl opacity-60"
            style={{ background: 'oklch(0.76 0.14 65 / 0.4)', transform: 'scale(1.5)' }}
          />
          <img
            src="/assets/generated/logo-icon.dim_128x128.png"
            alt="CoTimetable"
            className="relative w-20 h-20 rounded-2xl shadow-celestial"
          />
        </div>

        <h1
          className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight"
          style={{
            background: 'linear-gradient(135deg, oklch(0.84 0.14 88) 0%, oklch(0.76 0.14 65) 50%, oklch(0.90 0.08 80) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: 'none',
          }}
        >
          CoTimetable
        </h1>

        <p
          className="text-lg sm:text-xl font-display font-medium mb-3"
          style={{ color: 'oklch(0.84 0.14 88)' }}
        >
          Stay in sync across any timezone
        </p>

        <p className="text-muted-foreground text-sm sm:text-base mb-10 leading-relaxed max-w-lg">
          A shared timetable and chat for two friends — no matter where in the world you are.
          Schedule together, chat in real-time, and always know what time it is for each other.
        </p>

        <Button
          onClick={handleEnter}
          disabled={isLoggingIn}
          size="lg"
          className="font-semibold px-10 py-3 gap-2 text-base rounded-full shadow-amber transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, oklch(0.76 0.14 65) 0%, oklch(0.68 0.13 60) 100%)',
            color: 'oklch(0.12 0.03 270)',
            border: '1px solid oklch(0.84 0.14 88 / 0.4)',
          }}
        >
          {isLoggingIn ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              Enter the Sky
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1.5">
          <Star className="w-3 h-3" style={{ color: 'oklch(0.84 0.14 88)' }} />
          Secure login via Internet Identity — no password needed
        </p>
      </section>

      {/* Hero banner image */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-4 mb-10">
        <div className="relative rounded-2xl overflow-hidden shadow-celestial">
          <img
            src="/assets/generated/hero-banner.dim_1200x400.png"
            alt="CoTimetable"
            className="w-full h-40 sm:h-52 object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, transparent 30%, oklch(0.13 0.04 270 / 0.7) 100%)',
            }}
          />
        </div>
      </div>

      {/* Features */}
      <section className="relative z-10 max-w-4xl mx-auto px-4 pb-16 w-full">
        <h2
          className="font-display text-center text-xl font-semibold mb-6"
          style={{ color: 'oklch(0.84 0.14 88)' }}
        >
          Everything you need to stay connected
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: Clock,
              title: 'Live Clocks',
              desc: "See each other's current local time, always up to date.",
              glowClass: 'amber-glow',
              iconStyle: { color: 'oklch(0.76 0.14 65)' },
              bgStyle: { background: 'oklch(0.76 0.14 65 / 0.12)' },
            },
            {
              icon: MessageSquare,
              title: 'Real-Time Chat',
              desc: 'Send messages and share images or files instantly.',
              glowClass: 'gold-glow',
              iconStyle: { color: 'oklch(0.84 0.14 88)' },
              bgStyle: { background: 'oklch(0.84 0.14 88 / 0.12)' },
            },
            {
              icon: Calendar,
              title: 'Synced Timetable',
              desc: 'Dual-column schedule that aligns across timezones.',
              glowClass: 'indigo-glow',
              iconStyle: { color: 'oklch(0.62 0.18 285)' },
              bgStyle: { background: 'oklch(0.62 0.18 285 / 0.12)' },
            },
          ].map(({ icon: Icon, title, desc, glowClass, iconStyle, bgStyle }) => (
            <div
              key={title}
              className={`rounded-2xl p-5 glass-card hover:scale-[1.02] transition-all duration-300 ${glowClass}`}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                style={bgStyle}
              >
                <Icon className="w-5 h-5" style={iconStyle} />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-1.5 text-sm">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
