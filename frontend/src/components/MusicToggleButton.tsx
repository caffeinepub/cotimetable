import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAmbientMusic } from '../hooks/useAmbientMusic';

export default function MusicToggleButton() {
  const { isMuted, toggle } = useAmbientMusic();

  return (
    <button
      onClick={toggle}
      title={isMuted ? 'Play ambient music' : 'Mute ambient music'}
      aria-label={isMuted ? 'Play ambient music' : 'Mute ambient music'}
      className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
      style={{
        background: 'oklch(0.13 0.05 270 / 0.75)',
        backdropFilter: 'blur(12px)',
        border: isMuted
          ? '1px solid oklch(0.55 0.08 270 / 0.4)'
          : '1px solid oklch(0.76 0.14 65 / 0.6)',
        boxShadow: isMuted
          ? '0 2px 8px oklch(0 0 0 / 0.4)'
          : '0 0 16px oklch(0.76 0.14 65 / 0.35), 0 2px 8px oklch(0 0 0 / 0.4)',
      }}
    >
      {isMuted ? (
        <VolumeX
          className="w-4 h-4 transition-colors duration-300"
          style={{ color: 'oklch(0.65 0.06 270)' }}
        />
      ) : (
        <Volume2
          className="w-4 h-4 transition-colors duration-300"
          style={{ color: 'oklch(0.84 0.14 88)' }}
        />
      )}
    </button>
  );
}
