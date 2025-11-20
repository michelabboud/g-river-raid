/**
 * Virtual Joystick Component
 *
 * A touch-responsive virtual joystick for mobile devices that allows 8-directional
 * movement control. Mimics a physical arcade joystick with a base and movable stick.
 *
 * Features:
 * - 8-directional movement (up, down, left, right, and diagonals)
 * - Dead zone to prevent accidental inputs
 * - Visual feedback with stick position and glow effects
 * - Bounded movement within joystick base
 * - Multi-touch prevention
 *
 * @module components/VirtualJoystick
 */

import React, { useEffect, useRef, useState } from 'react';

/**
 * Direction state interface representing which directions are currently active
 */
interface JoystickDirection {
  /** True if user is pushing upward */
  up: boolean;
  /** True if user is pushing downward */
  down: boolean;
  /** True if user is pushing left */
  left: boolean;
  /** True if user is pushing right */
  right: boolean;
}

/**
 * Props for the VirtualJoystick component
 */
interface VirtualJoystickProps {
  /** Callback function invoked when joystick direction changes */
  onDirectionChange: (direction: JoystickDirection) => void;
}

/**
 * VirtualJoystick Component
 *
 * Renders a circular joystick control with a movable stick. Tracks touch
 * events to calculate the direction and magnitude of user input.
 *
 * The joystick uses a polar coordinate system internally, converting
 * cartesian touch coordinates to directional boolean flags.
 *
 * @param {VirtualJoystickProps} props - Component props
 * @returns {JSX.Element} Rendered virtual joystick
 */
export const VirtualJoystick: React.FC<VirtualJoystickProps> = ({ onDirectionChange }) => {
  // Track if the joystick is currently being touched
  const [active, setActive] = useState(false);

  // Current position of the stick relative to center (0,0 = centered)
  const [position, setPosition] = useState({ x: 0, y: 0 });

  // Reference to the joystick base element for coordinate calculations
  const baseRef = useRef<HTMLDivElement>(null);

  // Store the touch identifier to track specific touch across events
  const touchIdRef = useRef<number | null>(null);

  // Joystick dimensions and constraints
  const baseSize = 120;    // Diameter of the joystick base circle
  const stickSize = 50;    // Diameter of the movable stick
  const maxDistance = (baseSize - stickSize) / 2; // Maximum stick travel distance from center

  /**
   * Calculates directional booleans from stick displacement
   *
   * Converts cartesian coordinates (dx, dy) into boolean direction flags.
   * Implements a dead zone to prevent tiny movements from registering as input.
   *
   * Direction Thresholds:
   * - Dead zone: Distance < 10 pixels = no input
   * - Directional threshold: |component| > 10 = direction active
   *
   * This allows for:
   * - Pure cardinal directions (up, down, left, right)
   * - Diagonal directions (up+left, up+right, down+left, down+right)
   *
   * @param {number} dx - Horizontal displacement from center (positive = right)
   * @param {number} dy - Vertical displacement from center (positive = down)
   * @returns {JoystickDirection} Boolean flags for each direction
   *
   * @example
   * calculateDirection(0, -20) // Returns { up: true, down: false, left: false, right: false }
   * calculateDirection(15, -15) // Returns { up: true, down: false, left: false, right: true }
   */
  const calculateDirection = (dx: number, dy: number): JoystickDirection => {
    // Calculate polar coordinates
    const angle = Math.atan2(dy, dx); // Angle in radians
    const distance = Math.sqrt(dx * dx + dy * dy); // Distance from center

    // Dead zone: ignore very small movements to prevent jitter
    // This prevents accidental input from finger wobble or imprecise touches
    if (distance < 10) {
      return { up: false, down: false, left: false, right: false };
    }

    // Convert angle to degrees for easier debugging (optional, not used in logic)
    const angleDeg = (angle * 180 / Math.PI + 360) % 360;

    // Determine active directions based on component thresholds
    // Using component-based approach (vs angle sectors) allows clean diagonal movement
    return {
      up: dy < -10,     // Negative Y = upward on screen
      down: dy > 10,    // Positive Y = downward on screen
      left: dx < -10,   // Negative X = leftward
      right: dx > 10,   // Positive X = rightward
    };
  };

  /**
   * Handles the start of a touch event on the joystick
   *
   * Initializes joystick interaction when user first touches the joystick area.
   * Stores the touch identifier to track this specific touch across move/end events.
   *
   * @param {React.TouchEvent} e - Touch event object
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    // Get the first touch point
    const touch = e.touches[0];

    // Ignore if no touch or another touch is already being tracked
    if (!touch || touchIdRef.current !== null) return;

    // Store touch identifier for tracking
    touchIdRef.current = touch.identifier;

    // Activate visual feedback
    setActive(true);

    // Reset stick to center position
    setPosition({ x: 0, y: 0 });

    // Reset direction to neutral
    onDirectionChange({ up: false, down: false, left: false, right: false });
  };

  /**
   * Handles touch movement on the joystick
   *
   * Tracks the user's finger as they drag the virtual stick around.
   * Calculates the displacement from center, constrains it to the joystick bounds,
   * and converts it to directional input.
   *
   * Movement Constraints:
   * - Stick cannot move beyond maxDistance from center
   * - Movement is clamped to circular boundary (not square)
   *
   * @param {React.TouchEvent} e - Touch event object
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    // Ignore if no active touch or base element not mounted
    if (touchIdRef.current === null || !baseRef.current) return;

    // Find the touch that matches our stored identifier
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    // Get joystick base position on screen
    const rect = baseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Calculate displacement from center
    let dx = touch.clientX - centerX;
    let dy = touch.clientY - centerY;

    // Constrain stick position to maximum distance (circular boundary)
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > maxDistance) {
      // If beyond max distance, clamp to the boundary circle
      const angle = Math.atan2(dy, dx);
      dx = Math.cos(angle) * maxDistance;
      dy = Math.sin(angle) * maxDistance;
    }

    // Update stick visual position
    setPosition({ x: dx, y: dy });

    // Calculate and report direction to parent
    onDirectionChange(calculateDirection(dx, dy));
  };

  /**
   * Handles the end of a touch event on the joystick
   *
   * Resets the joystick to neutral state when user lifts their finger.
   * Also handles touch cancellation (system interrupts, gestures, etc.)
   *
   * @param {React.TouchEvent} e - Touch event object
   */
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    // Find the touch that matches our stored identifier
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    // Clear touch tracking
    touchIdRef.current = null;

    // Deactivate visual feedback
    setActive(false);

    // Return stick to center
    setPosition({ x: 0, y: 0 });

    // Reset direction to neutral
    onDirectionChange({ up: false, down: false, left: false, right: false });
  };

  return (
    // Main joystick container - positioned in bottom-right for right-thumb access
    <div
      ref={baseRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd} // Handle system interrupts
      className="fixed bottom-8 right-8 touch-none"
      style={{
        width: baseSize,
        height: baseSize,
        zIndex: 1000, // High z-index to stay above game canvas
      }}
    >
      {/* Base circle - the outer boundary of the joystick */}
      <div
        className="absolute inset-0 rounded-full border-4 border-white/30 bg-white/10"
        style={{
          backdropFilter: 'blur(4px)', // Glass-morphism effect
        }}
      >
        {/* Direction indicator arrows - visual guides for users */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-white/50 text-xs">▲</div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/50 text-xs">▼</div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-white/50 text-xs">◄</div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-white/50 text-xs">►</div>
      </div>

      {/* Movable stick - follows user's touch within the base boundary */}
      <div
        className={`absolute rounded-full transition-all ${
          active ? 'bg-white/60' : 'bg-white/40' // Brighter when active
        }`}
        style={{
          width: stickSize,
          height: stickSize,
          // Position stick relative to center, offset by position.x and position.y
          left: `calc(50% - ${stickSize / 2}px + ${position.x}px)`,
          top: `calc(50% - ${stickSize / 2}px + ${position.y}px)`,
          // Glow effect when active for visual feedback
          boxShadow: active ? '0 0 20px rgba(255,255,255,0.5)' : 'none',
        }}
      />
    </div>
  );
};
