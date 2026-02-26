import { useRef, useState, useEffect, useCallback } from 'react';

// Module-level singleton so the audio persists across re-renders and route changes
let audioInstance: HTMLAudioElement | null = null;

function getAudioInstance(): HTMLAudioElement {
  if (!audioInstance) {
    audioInstance = new Audio('/assets/ambient-music.mp3');
    audioInstance.loop = true;
    audioInstance.volume = 0.35;
  }
  return audioInstance;
}

export function useAmbientMusic() {
  const [isPlaying, setIsPlaying] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('ambientMusicPlaying');
    return stored === null ? false : stored === 'true';
  });
  const audioRef = useRef<HTMLAudioElement>(getAudioInstance());

  // Sync audio state on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.play().catch(() => {
        // Autoplay blocked by browser — silently fail and update state
        setIsPlaying(false);
        sessionStorage.setItem('ambientMusicPlaying', 'false');
      });
    } else {
      audio.pause();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const play = useCallback(() => {
    const audio = audioRef.current;
    audio.play().then(() => {
      setIsPlaying(true);
      sessionStorage.setItem('ambientMusicPlaying', 'true');
    }).catch(() => {
      setIsPlaying(false);
      sessionStorage.setItem('ambientMusicPlaying', 'false');
    });
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    audio.pause();
    setIsPlaying(false);
    sessionStorage.setItem('ambientMusicPlaying', 'false');
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  return { isPlaying, play, pause, toggle };
}
