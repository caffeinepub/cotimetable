import React, { useMemo } from 'react';

interface Particle {
  id: number;
  left: string;
  top: string;
  size: string;
  delay: string;
  duration: string;
}

function generateParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${20 + Math.random() * 70}%`,
    size: `${2 + Math.random() * 3}px`,
    delay: `${Math.random() * 8}s`,
    duration: `${5 + Math.random() * 6}s`,
  }));
}

export default function AnimatedSkyBackground() {
  const particles = useMemo(() => generateParticles(40), []);

  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {/* Base sky gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, oklch(0.10 0.09 285) 0%, oklch(0.15 0.08 278) 25%, oklch(0.22 0.08 265) 50%, oklch(0.38 0.11 55) 78%, oklch(0.55 0.14 48) 100%)',
        }}
      />

      {/* Starfield background image */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'url(/assets/generated/starfield-bg.dim_1920x1080.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Soft radial light rays near horizon */}
      <div
        className="absolute bottom-0 left-0 right-0 animate-light-ray-pulse"
        style={{
          height: '55%',
          background: 'radial-gradient(ellipse 80% 60% at 50% 100%, oklch(0.65 0.14 55 / 0.22) 0%, oklch(0.55 0.12 60 / 0.12) 40%, transparent 70%)',
        }}
      />

      {/* Secondary warm glow left */}
      <div
        className="absolute bottom-0 left-0 animate-light-ray-pulse"
        style={{
          width: '50%',
          height: '45%',
          background: 'radial-gradient(ellipse 60% 50% at 20% 100%, oklch(0.72 0.16 65 / 0.18) 0%, transparent 65%)',
          animationDelay: '1.5s',
        }}
      />

      {/* Secondary warm glow right */}
      <div
        className="absolute bottom-0 right-0 animate-light-ray-pulse"
        style={{
          width: '50%',
          height: '45%',
          background: 'radial-gradient(ellipse 60% 50% at 80% 100%, oklch(0.80 0.14 80 / 0.15) 0%, transparent 65%)',
          animationDelay: '2.5s',
        }}
      />

      {/* Indigo upper glow */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: '40%',
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, oklch(0.45 0.18 285 / 0.2) 0%, transparent 70%)',
        }}
      />

      {/* Cloud layer 1 — slow drift */}
      <div
        className="absolute"
        style={{
          top: '30%',
          left: '-10%',
          width: '120%',
          height: '120px',
          backgroundImage: 'url(/assets/generated/cloud-wisp-layer.dim_1920x400.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.18,
          animation: 'cloud-drift-slow 90s linear infinite',
        }}
      />

      {/* Cloud layer 2 — faster drift, offset */}
      <div
        className="absolute"
        style={{
          top: '50%',
          left: '-15%',
          width: '130%',
          height: '90px',
          backgroundImage: 'url(/assets/generated/cloud-wisp-layer.dim_1920x400.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.12,
          animation: 'cloud-drift-fast 60s linear infinite',
          animationDelay: '-20s',
          transform: 'scaleY(-1)',
        }}
      />

      {/* Cloud layer 3 — near horizon */}
      <div
        className="absolute"
        style={{
          bottom: '15%',
          left: '-5%',
          width: '110%',
          height: '80px',
          backgroundImage: 'url(/assets/generated/cloud-wisp-layer.dim_1920x400.png)',
          backgroundSize: '100% 100%',
          backgroundRepeat: 'no-repeat',
          opacity: 0.22,
          animation: 'cloud-drift-slow 75s linear infinite',
          animationDelay: '-35s',
        }}
      />

      {/* Floating light particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: p.id % 3 === 0
              ? 'oklch(0.84 0.14 88 / 0.9)'
              : p.id % 3 === 1
              ? 'oklch(0.76 0.14 65 / 0.8)'
              : 'oklch(0.90 0.08 80 / 0.7)',
            boxShadow: p.id % 3 === 0
              ? '0 0 6px oklch(0.84 0.14 88 / 0.8)'
              : '0 0 4px oklch(0.76 0.14 65 / 0.7)',
            animation: `float-up ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        />
      ))}

      {/* Subtle vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 50%, oklch(0.08 0.04 270 / 0.4) 100%)',
        }}
      />
    </div>
  );
}
