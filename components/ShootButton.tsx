import React, { useState, useRef } from 'react';

interface ShootButtonProps {
  onShoot: (shooting: boolean) => void;
}

export const ShootButton: React.FC<ShootButtonProps> = ({ onShoot }) => {
  const [active, setActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current !== null) return;

    const touch = e.touches[0];
    if (!touch) return;

    touchIdRef.current = touch.identifier;
    setActive(true);
    onShoot(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    touchIdRef.current = null;
    setActive(false);
    onShoot(false);
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className={`fixed bottom-8 left-8 touch-none transition-all ${
        active ? 'scale-95' : 'scale-100'
      }`}
      style={{
        width: 100,
        height: 100,
        zIndex: 1000,
      }}
    >
      {/* Button circle */}
      <div
        className={`w-full h-full rounded-full border-4 flex items-center justify-center ${
          active
            ? 'border-red-400/60 bg-red-500/30'
            : 'border-red-500/40 bg-red-500/20'
        }`}
        style={{
          backdropFilter: 'blur(4px)',
          boxShadow: active ? '0 0 30px rgba(239, 68, 68, 0.6)' : 'none',
        }}
      >
        {/* Fire icon */}
        <div className={`text-4xl ${active ? 'text-red-300' : 'text-red-400/70'}`}>
          🔥
        </div>
      </div>

      {/* Label */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold whitespace-nowrap">
        FIRE
      </div>
    </div>
  );
};
