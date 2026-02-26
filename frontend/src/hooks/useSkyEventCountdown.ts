import { useState, useEffect } from 'react';

/**
 * Sky: Children of the Light event schedule
 *
 * TGC HQ is in California → all cycles are anchored to America/Los_Angeles (Pacific Time, DST-aware).
 *
 * Each 2-hour cycle block starts at 00:00, 02:00, 04:00 … PT.
 * Within each cycle:
 *   Geyser  → cycle_start + 5 min  (lasts 10 min)
 *   Grandma → cycle_start + 30 min (lasts 10 min)
 *   Turtle  → cycle_start + 40 min (lasts 10 min)
 */

const CYCLE_MINUTES = 120;
const GEYSER_OFFSET_MINS = 5;
const GRANDMA_OFFSET_MINS = 30;
const TURTLE_OFFSET_MINS = 40;

export interface CountdownTime {
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export interface SkyEventCountdown {
  countdown: CountdownTime;
  nextOccurrence: Date;
  isActive: boolean;
  secondsRemaining: number;
}

/**
 * Get the current Pacific Time components using Intl.DateTimeFormat.
 * Returns { ptHour, ptMinute, ptSecond, ptTotalMinutes }
 */
function getPacificTimeInfo(now: Date): {
  ptHour: number;
  ptMinute: number;
  ptSecond: number;
  ptTotalMinutes: number;
} {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const get = (type: string) => parseInt(parts.find(p => p.type === type)?.value ?? '0', 10);

  const ptHour = get('hour') % 24; // formatToParts hour12:false can return 24 for midnight
  const ptMinute = get('minute');
  const ptSecond = get('second');
  const ptTotalMinutes = ptHour * 60 + ptMinute + ptSecond / 60;

  return { ptHour, ptMinute, ptSecond, ptTotalMinutes };
}

/**
 * Get the Pacific Time midnight (00:00:00 PT) for the current PT date as a UTC timestamp.
 */
function getPacificMidnightUTC(now: Date): number {
  // Format the current date in PT to get the PT date string
  const dateFormatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const ptDateStr = dateFormatter.format(now); // "YYYY-MM-DD"

  const [year, month, day] = ptDateStr.split('-').map(Number);

  const refFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  // Binary search for exact PT midnight
  let lo = Date.UTC(year, month - 1, day, 6, 0, 0);  // PT is at most UTC-6 (DST)
  let hi = Date.UTC(year, month - 1, day, 9, 0, 0);  // PT is at least UTC-9

  for (let i = 0; i < 30; i++) {
    const mid = Math.floor((lo + hi) / 2);
    const parts = refFormatter.formatToParts(new Date(mid));
    const h = parseInt(parts.find(p => p.type === 'hour')?.value ?? '0', 10) % 24;
    const m = parseInt(parts.find(p => p.type === 'minute')?.value ?? '0', 10);
    const s = parseInt(parts.find(p => p.type === 'second')?.value ?? '0', 10);
    const totalSec = h * 3600 + m * 60 + s;
    if (totalSec === 0) return mid;
    if (totalSec > 43200) {
      // PT time is in PM, midnight is after this point
      hi = mid;
    } else {
      lo = mid;
    }
  }

  return lo;
}

/**
 * Given an offset in minutes from the top of each 2-hour PT cycle,
 * returns the next occurrence Date and whether the event is currently active.
 */
function getNextOccurrencePT(
  offsetMinutes: number,
  durationMinutes: number
): { nextOccurrence: Date; isActive: boolean } {
  const now = new Date();
  const { ptTotalMinutes } = getPacificTimeInfo(now);

  // Which 2-hour cycle block are we in (PT)?
  const currentCycleIndex = Math.floor(ptTotalMinutes / CYCLE_MINUTES);
  const minutesIntoCycle = ptTotalMinutes % CYCLE_MINUTES;

  // Is the event currently active?
  const isActive =
    minutesIntoCycle >= offsetMinutes &&
    minutesIntoCycle < offsetMinutes + durationMinutes;

  // Determine which cycle the next occurrence is in
  let nextCycleIndex = currentCycleIndex;
  if (minutesIntoCycle >= offsetMinutes) {
    // Already past this event in the current cycle → next cycle
    nextCycleIndex = currentCycleIndex + 1;
  }

  // Get PT midnight UTC timestamp
  const ptMidnightUTC = getPacificMidnightUTC(now);

  // Next occurrence in UTC ms
  const nextOccurrenceMs =
    ptMidnightUTC +
    nextCycleIndex * CYCLE_MINUTES * 60 * 1000 +
    offsetMinutes * 60 * 1000;

  const nextOccurrence = new Date(nextOccurrenceMs);

  return { nextOccurrence, isActive };
}

function msToCountdown(ms: number): CountdownTime {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds, totalSeconds };
}

/**
 * Hook that returns a live countdown to the next Sky CotL event occurrence,
 * anchored to America/Los_Angeles (Pacific Time) with DST awareness.
 */
export function useSkyEventCountdown(
  offsetMinutes: number,
  durationMinutes: number
): SkyEventCountdown {
  const [state, setState] = useState<SkyEventCountdown>(() => {
    const { nextOccurrence, isActive } = getNextOccurrencePT(offsetMinutes, durationMinutes);
    const countdown = msToCountdown(nextOccurrence.getTime() - Date.now());
    return { countdown, nextOccurrence, isActive, secondsRemaining: countdown.totalSeconds };
  });

  useEffect(() => {
    const tick = () => {
      const { nextOccurrence, isActive } = getNextOccurrencePT(offsetMinutes, durationMinutes);
      const countdown = msToCountdown(nextOccurrence.getTime() - Date.now());
      setState({ countdown, nextOccurrence, isActive, secondsRemaining: countdown.totalSeconds });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [offsetMinutes, durationMinutes]);

  return state;
}

export { GEYSER_OFFSET_MINS, GRANDMA_OFFSET_MINS, TURTLE_OFFSET_MINS };
