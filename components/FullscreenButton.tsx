/**
 * Fullscreen Toggle Button Component
 *
 * Provides a button to enter and exit fullscreen mode for immersive gameplay.
 * Particularly useful on mobile devices for maximum screen real estate.
 *
 * Features:
 * - Fullscreen API integration with cross-browser support
 * - Dynamic icon that changes based on fullscreen state
 * - Event listener to track fullscreen changes (including ESC key exits)
 * - Error handling for unsupported browsers
 *
 * @module components/FullscreenButton
 */

import React, { useState, useEffect } from 'react';

/**
 * FullscreenButton Component
 *
 * Renders a button in the top-right corner that toggles fullscreen mode.
 * The button icon changes to reflect the current fullscreen state, and
 * it responds to both button clicks and ESC key exits.
 *
 * @returns {JSX.Element} Rendered fullscreen toggle button
 */
export const FullscreenButton: React.FC = () => {
  // Track current fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(false);

  /**
   * Effect hook to listen for fullscreen changes
   *
   * Sets up an event listener for the 'fullscreenchange' event, which fires when:
   * - User clicks the fullscreen button
   * - User presses ESC to exit fullscreen
   * - Browser exits fullscreen for any reason
   *
   * This ensures the button icon always reflects the current state.
   */
  useEffect(() => {
    /**
     * Updates component state based on document.fullscreenElement
     * Converts to boolean (truthy/falsy) for cleaner state management
     */
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    // Register the event listener
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Cleanup: remove event listener when component unmounts
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  /**
   * Toggles fullscreen mode on/off
   *
   * Uses the Fullscreen API to enter or exit fullscreen mode:
   * - Enter: Requests fullscreen on the document root element
   * - Exit: Exits fullscreen mode entirely
   *
   * The API is asynchronous and may fail (e.g., if fullscreen is blocked
   * by browser settings or security policies), so we wrap it in try/catch.
   *
   * @async
   */
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        // Not in fullscreen - request fullscreen on the entire document
        await document.documentElement.requestFullscreen();
      } else {
        // Already in fullscreen - exit fullscreen
        await document.exitFullscreen();
      }
    } catch (err) {
      // Log error if fullscreen request fails (e.g., browser doesn't support it)
      console.error('Error toggling fullscreen:', err);
    }
  };

  return (
    // Button positioned in top-right corner, above all other elements
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-[1001] bg-black/40 hover:bg-black/60 border-2 border-white/30 hover:border-white/50 rounded-lg p-2 transition-all backdrop-blur-sm"
      style={{
        width: 44,
        height: 44,
      }}
      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'} // Tooltip for accessibility
    >
      {isFullscreen ? (
        // Exit fullscreen icon (compress/shrink icon)
        // Shows four arrows pointing inward, indicating "return to normal size"
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
        </svg>
      ) : (
        // Enter fullscreen icon (expand icon)
        // Shows four arrows pointing outward, indicating "expand to full screen"
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full"
        >
          <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
        </svg>
      )}
    </button>
  );
};
