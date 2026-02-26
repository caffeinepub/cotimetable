import { useState, useEffect, useCallback } from 'react';

// ─── Module-level singleton state ─────────────────────────────────────────────
// We keep both the Audio element and the muted state at module level so that
// all hook instances share the same source of truth across re-renders and
// route changes.

let audioInstance: HTMLAudioElement | null = null;
let globalIsMuted = true; // start muted until user explicitly unmutes

// Listeners so every hook instance re-renders when state changes
const listeners = new Set<(muted: boolean) => void>();

function notifyListeners(muted: boolean) {
  listeners.forEach((fn) => fn(muted));
}

function getAudio(): HTMLAudioElement {
  if (!audioInstance) {
    audioInstance = new Audio('/assets/ambient-music.mp3');
    audioInstance.loop = true;
    audioInstance.volume = 0.35;
    // Sync globalIsMuted with actual audio state on any external pause
    audioInstance.addEventListener('pause', () => {
      if (!globalIsMuted) {
        globalIsMuted = true;
        sessionStorage.setItem('ambientMusicMuted', 'true');
        notifyListeners(true);
      }
    });
    audioInstance.addEventListener('play', () => {
      if (globalIsMuted) {
        globalIsMuted = false;
        sessionStorage.setItem('ambientMusicMuted', 'false');
        notifyListeners(false);
      }
    });
  }
  return audioInstance;
}

// Restore persisted preference once (module-level, runs once on first import)
try {
  const storedMuted = sessionStorage.getItem('ambientMusicMuted');
  if (storedMuted !== null) {
    globalIsMuted = storedMuted === 'true';
  }
} catch {
  // sessionStorage not available
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAmbientMusic() {
  const [isMuted, setIsMuted] = useState<boolean>(globalIsMuted);

  // Subscribe to global state changes
  useEffect(() => {
    const handler = (muted: boolean) => setIsMuted(muted);
    listeners.add(handler);
    // Sync with current global state on mount
    setIsMuted(globalIsMuted);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  // On mount: if the user previously had music playing, attempt autoplay
  useEffect(() => {
    if (!globalIsMuted) {
      const audio = getAudio();
      audio.play().catch(() => {
        // Browser blocked autoplay — stay muted until user interacts
        globalIsMuted = true;
        try { sessionStorage.setItem('ambientMusicMuted', 'true'); } catch { /* noop */ }
        notifyListeners(true);
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = useCallback(() => {
    const audio = getAudio();
    if (globalIsMuted) {
      // Currently muted → play
      audio.play().then(() => {
        globalIsMuted = false;
        try { sessionStorage.setItem('ambientMusicMuted', 'false'); } catch { /* noop */ }
        notifyListeners(false);
      }).catch(() => {
        // Still blocked — keep muted
        globalIsMuted = true;
        try { sessionStorage.setItem('ambientMusicMuted', 'true'); } catch { /* noop */ }
        notifyListeners(true);
      });
    } else {
      // Currently playing → pause
      audio.pause();
      globalIsMuted = true;
      try { sessionStorage.setItem('ambientMusicMuted', 'true'); } catch { /* noop */ }
      notifyListeners(true);
    }
  }, []);

  return { isMuted, toggle };
}
