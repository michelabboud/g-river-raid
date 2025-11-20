import React, { useEffect, useRef, useState } from 'react';

interface JoystickDirection {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
}

interface VirtualJoystickProps {
  onDirectionChange: (direction: JoystickDirection) => void;
}

export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onDirectionChange }) => {
  const [active, setActive] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const baseRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  const baseSize = 120;
  const stickSize = 50;
  const maxDistance = (baseSize - stickSize) / 2;

  const calculateDirection = (dx: number, dy: number): JoystickDirection => {
    const angle = Math.atan2(dy, dx);
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Dead zone
    if (distance < 10) {
      return { up: false, down: false, left: false, right: false };
    }

    // Determine primary and secondary directions
    const angleDeg = (angle * 180 / Math.PI + 360) % 360;

    return {
      up: dy < -10,
      down: dy > 10,
      left: dx < -10,
      right: dx > 10,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (!touch || touchIdRef.current !== null) return;

    touchIdRef.current = touch.identifier;
    setActive(true);
    setPosition({ x: 0, y: 0 });
    onDirectionChange({ up: false, down: false, left: false, right: false });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null || !baseRef.current) return;

    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    // Limit distance
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    setPosition({ x: dx, y: dy });
    onDirectionChange(calculateDirection(dx, dy));
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    touchIdRef.current = null;
    setActive(false);
    setPosition({ x: 0, y: 0 });
    onDirectionChange({ up: false, down: false, left: false, right: false });
  };

  return (
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      className="fixed bottom-8 right-8 touch-none"
      style={{
        width: baseSize,
        height: baseSize,
        zIndex: 1000,
      }}
    >
      {/* Base circle */}
      <div
        className="absolute inset-0 rounded-full border-4 border-white/30 bg-white/10"
        style={{
          backdropFilter: 'blur(4px)',
        }}
      >
        {/* Direction indicators */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/50 text-xs">▲</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 text-xs">▼</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 text-xs">◄</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 text-xs">►</div>
      </div>

      {/* Stick */}
      <div
        className={`absolute rounded-full transition-all ${
          active ? 'bg-white/60' : 'bg-white/40'
        }`}
        style={{
          width: stickSize,
          height: stickSize,
          left: `calc(50% - ${stickSize / 2}px + ${position.x}px)`,
          top: `calc(50% - ${stickSize / 2}px + ${position.y}px)`,
          boxShadow: active ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
        }}
      />
    </div>
  );
};
