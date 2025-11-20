/**
 * Mobile Device Utilities
 *
 * This module provides utility functions for detecting mobile devices
 * and calculating appropriate canvas scaling for responsive gameplay.
 *
 * @module utils/mobile
 */

/**
 * Detects if the current device is a mobile device
 *
 * Uses a combination of user agent string detection and touch capability
 * checking to determine if the device is mobile.
 *
 * Detection methods:
 * 1. User Agent String: Checks for common mobile device identifiers
 * 2. Touch Support: Verifies presence of touch event support
 *
 * @returns {boolean} True if the device is mobile, false otherwise
 *
 * @example
 * if (isMobileDevice()) {
 *   // Show touch controls
 *   displayVirtualJoystick();
 * }
 */
export const isMobileDevice = (): boolean => {
  // Server-side rendering safety: return false if window is undefined
  if (typeof window === 'undefined') return false;

  // Check user agent for mobile device identifiers
  // Matches: Android, iOS (iPhone/iPad/iPod), Windows Phone, BlackBerry, Opera Mini
  const mobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );

  // Check for touch support (catches some tablets not in user agent list)
  const hasTouchSupport = 'ontouchstart' in window;

  return mobileUserAgent || hasTouchSupport;
};

/**
 * Calculates the optimal canvas scale factor based on device and screen size
 *
 * This function determines how much to scale the game canvas to fit different
 * screen sizes while maintaining aspect ratio and leaving room for UI elements.
 *
 * Scaling Strategy:
 * - Desktop: Dynamic scaling up to 80% of window size for immersive experience
 * - Mobile: Dynamic scaling based on screen dimensions
 *   - Accounts for virtual joystick and fire button (110-132px)
 *   - Accounts for HUD elements at top (40px)
 *   - Leaves margins for browser UI (address bar, navigation)
 *   - Caps at 2.0x maximum to prevent oversized rendering
 *
 * Canvas Base Dimensions:
 * - Width: 320px
 * - Height: 480px
 *
 * @returns {number} Scale factor (1.0 = original size, 1.5 = 150%, etc.)
 *
 * @example
 * const scale = getCanvasScale();
 * canvas.style.width = `${320 * scale}px`;
 * canvas.style.height = `${480 * scale}px`;
 */
export const getCanvasScale = (): number => {
  // Server-side rendering safety: return default scale if window is undefined
  if (typeof window === 'undefined') return 1;

  const isMobile = isMobileDevice();

  // Get current screen dimensions
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Game canvas base dimensions (before scaling)
  const canvasWidth = 320;
  const canvasHeight = 480;

  if (!isMobile) {
    // Desktop devices: dynamic scaling up to 80% of window size
    // Leave 10% margin on each side (80% total usage)
    const scaleX = (screenWidth * 0.80) / canvasWidth;
    const scaleY = (screenHeight * 0.80) / canvasHeight;

    // Use the smaller scale to maintain aspect ratio
    // Set reasonable bounds: min 1.5x, max 4.0x for very large screens
    const scale = Math.max(1.5, Math.min(scaleX, scaleY, 4.0));
    return scale;
  }

  // Mobile devices: calculate dynamic scale based on screen size

  // Calculate reserved space for UI elements:
  // - Touch controls at bottom: 110-132px (increased joystick + fire button)
  // - HUD at top: 40px (score, lives, fuel gauge)
  // Total reserved height: 180px
  const reservedHeight = 180;
  const availableHeight = screenHeight - reservedHeight;

  // Calculate scale factors for width and height
  // Leave 10% horizontal margin (5% on each side) for comfortable viewing
  const scaleX = (screenWidth * 0.90) / canvasWidth;

  // Leave 5% vertical margin in available space for buffer
  const scaleY = (availableHeight * 0.95) / canvasHeight;

  // Use the smaller scale to ensure both dimensions fit
  // Cap at 2.0x maximum to prevent oversized rendering on very large screens
  const scale = Math.min(scaleX, scaleY, 2.0);

  return scale;
};
