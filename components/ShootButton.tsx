/**
 * Mobile Fire/Shoot Button Component
 *
 * A touch-responsive button for mobile devices that allows players to fire weapons.
 * Provides visual and tactile feedback through scaling animations and color changes.
 *
 * Features:
 * - Touch event handling with proper identifier tracking
 * - Visual feedback (scaling, color changes, glow effects)
 * - Prevents accidental multi-touch interactions
 * - Positioned in bottom-left corner for easy thumb access
 *
 * @module components/ShootButton
 */

import React, { useState, useRef } from 'react';

/**
 * Props for the ShootButton component
 */
interface ShootButtonProps {
  /** Callback function invoked when shooting state changes */
  onShoot: (shooting: boolean) => void;
}

/**
 * ShootButton Component
 *
 * Renders a circular fire button for mobile gameplay. Handles touch events
 * to detect when the player is pressing the fire button, and communicates
 * the shooting state back to the parent game component.
 *
 * @param {ShootButtonProps} props - Component props
 * @returns {JSX.Element} Rendered shoot button
 */
export const ShootButton: React.FC<ShootButtonProps> = ({ onShoot }) => {
  // State to track if the button is currently being pressed
  const [active, setActive] = useState(false);

  // Reference to store the touch identifier to prevent multi-touch conflicts
  // Each touch event has a unique identifier; we only respond to the first touch
  const touchIdRef = useRef<number | null>(null);

  // Reference to the button element for boundary checking
  const buttonRef = useRef<HTMLDivElement>(null);

  // Timer for auto-release after touch moves outside button
  const releaseTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clears the release timer if it exists
   */
  const clearReleaseTimer = () => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
  };

  /**
   * Releases the button and stops shooting
   */
  const releaseButton = () => {
    touchIdRef.current = null;
    setActive(false);
    onShoot(false);
    clearReleaseTimer();
  };

  /**
   * Handles the start of a touch event on the fire button
   *
   * When the user touches the button:
   * 1. Prevents default browser behavior (scrolling, text selection)
   * 2. Checks if another touch is already active (prevents multi-touch issues)
   * 3. Stores the touch identifier for tracking
   * 4. Activates visual feedback
   * 5. Notifies parent component that shooting has started
   *
   * @param {React.TouchEvent} e - Touch event object
   */
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    // Ignore if another touch is already active on this button
    if (touchIdRef.current !== null) return;

    // Get the first touch point
    const touch = e.touches[0];
    if (!touch) return;

    // Clear any existing release timer
    clearReleaseTimer();

    // Store the touch identifier to track this specific touch
    touchIdRef.current = touch.identifier;

    // Activate visual feedback
    setActive(true);

    // Notify parent that shooting has started
    onShoot(true);
  };

  /**
   * Handles touch movement to detect when user slides finger off button
   *
   * If the touch moves outside the button area, schedule a delayed release.
   * This gives a small grace period before stopping fire.
   *
   * @param {React.TouchEvent} e - Touch event object
   */
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchIdRef.current === null || !buttonRef.current) return;

    // Find the touch that matches our stored identifier
    const touch = Array.from(e.touches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    // Check if touch is still within button bounds
    const rect = buttonRef.current.getBoundingClientRect();
    const isInside =
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom;

    if (!isInside) {
      // Touch has moved outside button - schedule release after 250ms
      if (!releaseTimerRef.current) {
        releaseTimerRef.current = setTimeout(() => {
          releaseButton();
        }, 250);
      }
    } else {
      // Touch is back inside - cancel any pending release
      clearReleaseTimer();
    }
  };

  /**
   * Handles the end of a touch event on the fire button
   *
   * When the user lifts their finger:
   * 1. Prevents default browser behavior
   * 2. Finds the touch that matches our stored identifier
   * 3. Clears the touch identifier
   * 4. Deactivates visual feedback
   * 5. Notifies parent component that shooting has stopped
   *
   * This also handles touch cancellation (e.g., if the user's finger moves
   * outside the button area or is interrupted by a system event)
   *
   * @param {React.TouchEvent} e - Touch event object
   */
  const handleTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();

    // Find the touch that matches our stored identifier
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (!touch) return;

    // Release the button immediately
    releaseButton();
  };

  return (
    // Main button container with touch event handlers
    // Positioned in bottom-left for comfortable thumb reach on mobile
    <div
      ref={buttonRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd} // Handle interrupted touches (system gestures, etc.)
      className={`fixed bottom-8 left-8 touch-none transition-all ${
        active ? 'scale-95' : 'scale-100' // Shrink slightly when pressed for tactile feedback
      }`}
      style={{
        width: 100,
        height: 100,
        zIndex: 1000, // High z-index to stay above game canvas
      }}
    >
      {/* Button circle with dynamic styling based on active state */}
      <div
        className={`w-full h-full rounded-full border-4 flex items-center justify-center ${
          active
            ? 'border-red-400/60 bg-red-500/30' // Brighter colors when active
            : 'border-red-500/40 bg-red-500/20' // Dimmer colors when inactive
        }`}
        style={{
          backdropFilter: 'blur(4px)', // Glass-morphism effect for modern look
          boxShadow: active ? '0 0 30px rgba(239, 68, 68, 0.6)' : 'none', // Glow effect when active
        }}
      >
        {/* Fire emoji icon - simple and universally understood */}
        <div className={`text-4xl ${active ? 'text-red-300' : 'text-red-400/70'}`}>
          🔥
        </div>
      </div>

      {/* Label text below the button */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold whitespace-nowrap">
        FIRE
      </div>
    </div>
  );
};
