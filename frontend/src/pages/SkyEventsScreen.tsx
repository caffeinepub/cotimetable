import React, { useState, useEffect } from 'react';
import { ArrowLeft, Droplets, Flame, Turtle } from 'lucide-react';
import {
  useSkyEventCountdown,
  GEYSER_OFFSET_MINS,
  GRANDMA_OFFSET_MINS,
  TURTLE_OFFSET_MINS,
} from '../hooks/useSkyEventCountdown';

// Event durations in minutes
const GEYSER_DURATION = 10;
const GRANDMA_DURATION = 10;
const TURTLE_DURATION = 10;

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Format a Date as HH:MM in the user's local timezone */
function formatLocalTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Format a Date as HH:MM:SS in Pacific Time */
function formatPacificTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

/** Live clock hook — returns a formatted time string, updating every second */
function useLiveClock(formatter: (d: Date) => string): string {
  const [display, setDisplay] = useState(() => formatter(new Date()));
  useEffect(() => {
    const tick = () => setDisplay(formatter(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [formatter]);
  return display;
}

interface EventRowProps {
  name: string;
  icon: React.ReactNode;
  accentColor: string;
  glowColor: string;
  offsetMinutes: number;
  durationMinutes: number;
}

function EventRow({ name, icon, accentColor, glowColor, offsetMinutes, durationMinutes }: EventRowProps) {
  const { countdown, nextOccurrence, isActive } = useSkyEventCountdown(offsetMinutes, durationMinutes);

  const countdownStr = `${pad(countdown.hours)}:${pad(countdown.minutes)}:${pad(countdown.seconds)}`;
  const nextLocalTime = formatLocalTime(nextOccurrence);

  return (
    <tr
      className="transition-all duration-300"
      style={{
        background: isActive ? `${accentColor}18` : 'transparent',
      }}
    >
      {/* Event Name */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: `${accentColor}22`,
              border: `1px solid ${accentColor}44`,
              boxShadow: isActive ? `0 0 10px ${glowColor}` : 'none',
            }}
          >
            {icon}
          </div>
          <div className="flex items-center gap-2">
            <span
              className="font-display font-semibold text-sm"
              style={{ color: accentColor }}
            >
              {name}
            </span>
            {isActive && (
              <span className="flex items-center gap-1">
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: accentColor }}
                />
                <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: accentColor }}>
                  Now
                </span>
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Next Event (local time) */}
      <td className="py-3 px-4 text-center">
        <span
          className="font-semibold text-sm tabular-nums"
          style={{ color: isActive ? accentColor : 'oklch(0.78 0.06 270)' }}
        >
          {isActive ? 'Active!' : nextLocalTime}
        </span>
      </td>

      {/* Time to Next (HH:MM:SS countdown) */}
      <td className="py-3 px-4 text-center">
        <span
          className="font-display font-bold text-base tabular-nums tracking-wider"
          style={{
            color: accentColor,
            textShadow: isActive ? `0 0 12px ${glowColor}` : 'none',
          }}
        >
          {countdownStr}
        </span>
      </td>
    </tr>
  );
}

interface SkyEventsScreenProps {
  onBack: () => void;
}

export default function SkyEventsScreen({ onBack }: SkyEventsScreenProps) {
  // Live Pacific Time clock
  const pacificTimeStr = useLiveClock((d) =>
    formatPacificTime(d)
  );

  // Live local time clock
  const localTimeStr = useLiveClock((d) =>
    d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  );

  // Local timezone label
  const localTzLabel = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 py-4 gap-4 relative z-10">
      {/* Header */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'oklch(0.17 0.05 270 / 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid oklch(0.76 0.14 65 / 0.2)',
          boxShadow: '0 4px 24px oklch(0.08 0.04 270 / 0.4)',
        }}
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 shrink-0"
            style={{
              background: 'oklch(0.76 0.14 65 / 0.12)',
              border: '1px solid oklch(0.76 0.14 65 / 0.25)',
              color: 'oklch(0.84 0.14 88)',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1
              className="font-display font-bold text-xl leading-tight"
              style={{ color: 'oklch(0.84 0.14 88)' }}
            >
              Sky Events Clock
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Live countdowns for recurring Sky: CotL world events
            </p>
          </div>
        </div>

        {/* Cycle info bar */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{ borderTop: '1px solid oklch(0.76 0.14 65 / 0.1)' }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'oklch(0.76 0.14 65)' }}
          />
          <p className="text-xs text-muted-foreground">
            Events repeat every{' '}
            <span style={{ color: 'oklch(0.84 0.14 88)' }} className="font-semibold">2 hours</span>{' '}
            anchored to{' '}
            <span style={{ color: 'oklch(0.84 0.14 88)' }} className="font-semibold">Pacific Time</span>{' '}
            (TGC HQ, California)
          </p>
        </div>
      </div>

      {/* Time Clocks — Sky Mean Time + Local Time */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Sky Mean Time (Pacific Time) */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center justify-center gap-1"
          style={{
            background: 'oklch(0.17 0.06 35 / 0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid oklch(0.72 0.22 35 / 0.3)',
            boxShadow: '0 0 28px oklch(0.72 0.22 35 / 0.18), 0 4px 24px oklch(0.08 0.04 270 / 0.4)',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'oklch(0.72 0.22 35 / 0.8)' }}
          >
            Sky Mean Time
          </p>
          <div
            className="font-display font-bold text-4xl sm:text-5xl tabular-nums tracking-widest mt-1"
            style={{
              color: 'oklch(0.84 0.18 55)',
              textShadow: '0 0 24px oklch(0.72 0.22 35 / 0.5)',
            }}
          >
            {pacificTimeStr}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            America/Los_Angeles (Pacific)
          </p>
        </div>

        {/* Local Time */}
        <div
          className="rounded-2xl p-5 flex flex-col items-center justify-center gap-1"
          style={{
            background: 'oklch(0.17 0.05 270 / 0.82)',
            backdropFilter: 'blur(20px)',
            border: '1px solid oklch(0.72 0.15 285 / 0.3)',
            boxShadow: '0 0 28px oklch(0.72 0.15 285 / 0.18), 0 4px 24px oklch(0.08 0.04 270 / 0.4)',
          }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: 'oklch(0.72 0.15 285 / 0.8)' }}
          >
            Local Time
          </p>
          <div
            className="font-display font-bold text-4xl sm:text-5xl tabular-nums tracking-widest mt-1"
            style={{
              color: 'oklch(0.82 0.12 285)',
              textShadow: '0 0 24px oklch(0.72 0.15 285 / 0.5)',
            }}
          >
            {localTimeStr}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-full px-2 text-center">
            {localTzLabel}
          </p>
        </div>
      </div>

      {/* Events Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'oklch(0.17 0.05 270 / 0.85)',
          backdropFilter: 'blur(20px)',
          border: '1px solid oklch(0.38 0.08 270 / 0.4)',
          boxShadow: '0 4px 24px oklch(0.08 0.04 270 / 0.4)',
        }}
      >
        <table className="w-full">
          <thead>
            <tr
              style={{
                borderBottom: '1px solid oklch(0.38 0.08 270 / 0.35)',
                background: 'oklch(0.14 0.04 270 / 0.6)',
              }}
            >
              <th className="py-3 px-4 text-left">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'oklch(0.76 0.14 65)' }}
                >
                  Event Name
                </span>
              </th>
              <th className="py-3 px-4 text-center">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'oklch(0.76 0.14 65)' }}
                >
                  Next Event
                </span>
                <p className="text-[10px] text-muted-foreground font-normal normal-case tracking-normal mt-0.5">
                  your local time
                </p>
              </th>
              <th className="py-3 px-4 text-center">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: 'oklch(0.76 0.14 65)' }}
                >
                  Time to Next
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Dividers between rows */}
            <tr style={{ height: 0 }}>
              <td colSpan={3} style={{ padding: 0 }}>
                <div style={{ borderTop: '1px solid oklch(0.38 0.08 270 / 0.2)' }} />
              </td>
            </tr>

            <EventRow
              name="Grandma"
              icon={<Droplets className="w-4 h-4" style={{ color: 'oklch(0.76 0.14 65)' }} />}
              accentColor="oklch(0.76 0.14 65)"
              glowColor="oklch(0.76 0.14 65 / 0.4)"
              offsetMinutes={GRANDMA_OFFSET_MINS}
              durationMinutes={GRANDMA_DURATION}
            />

            <tr style={{ height: 0 }}>
              <td colSpan={3} style={{ padding: 0 }}>
                <div style={{ borderTop: '1px solid oklch(0.38 0.08 270 / 0.2)' }} />
              </td>
            </tr>

            <EventRow
              name="Turtle"
              icon={<Turtle className="w-4 h-4" style={{ color: 'oklch(0.72 0.15 285)' }} />}
              accentColor="oklch(0.72 0.15 285)"
              glowColor="oklch(0.72 0.15 285 / 0.4)"
              offsetMinutes={TURTLE_OFFSET_MINS}
              durationMinutes={TURTLE_DURATION}
            />

            <tr style={{ height: 0 }}>
              <td colSpan={3} style={{ padding: 0 }}>
                <div style={{ borderTop: '1px solid oklch(0.38 0.08 270 / 0.2)' }} />
              </td>
            </tr>

            <EventRow
              name="Geyser"
              icon={<Flame className="w-4 h-4" style={{ color: 'oklch(0.72 0.22 35)' }} />}
              accentColor="oklch(0.72 0.22 35)"
              glowColor="oklch(0.72 0.22 35 / 0.4)"
              offsetMinutes={GEYSER_OFFSET_MINS}
              durationMinutes={GEYSER_DURATION}
            />
          </tbody>
        </table>
      </div>

      {/* Schedule reference — Pacific Time */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: 'oklch(0.17 0.05 270 / 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid oklch(0.38 0.08 270 / 0.4)',
        }}
      >
        <h2
          className="font-display font-semibold text-sm mb-3"
          style={{ color: 'oklch(0.84 0.14 88)' }}
        >
          Today's Schedule (Pacific Time)
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((cycle) => {
            const cycleStartMins = cycle * 120;
            const geyserMins = cycleStartMins + GEYSER_OFFSET_MINS;
            const grandmaMins = cycleStartMins + GRANDMA_OFFSET_MINS;
            const turtleMins = cycleStartMins + TURTLE_OFFSET_MINS;

            const fmt = (totalMins: number) => {
              const h = Math.floor(totalMins / 60) % 24;
              const m = totalMins % 60;
              const ampm = h < 12 ? 'AM' : 'PM';
              const h12 = h % 12 === 0 ? 12 : h % 12;
              return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
            };

            return (
              <div
                key={cycle}
                className="rounded-xl p-2.5 text-xs"
                style={{
                  background: 'oklch(0.13 0.04 270 / 0.6)',
                  border: '1px solid oklch(0.38 0.08 270 / 0.3)',
                }}
              >
                <p className="font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider text-[10px]">
                  C{cycle + 1}
                </p>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'oklch(0.76 0.14 65)' }} />
                    <span style={{ color: 'oklch(0.76 0.14 65)' }} className="text-[10px]">{fmt(grandmaMins)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'oklch(0.72 0.15 285)' }} />
                    <span style={{ color: 'oklch(0.72 0.15 285)' }} className="text-[10px]">{fmt(turtleMins)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'oklch(0.72 0.22 35)' }} />
                    <span style={{ color: 'oklch(0.72 0.22 35)' }} className="text-[10px]">{fmt(geyserMins)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
