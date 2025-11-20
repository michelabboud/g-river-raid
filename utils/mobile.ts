export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;

  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  ) || ('ontouchstart' in window);
};

export const getCanvasScale = (): number => {
  if (typeof window === 'undefined') return 1;

  const isMobile = isMobileDevice();
  if (!isMobile) return 1.5; // PC scale

  // Mobile: scale to fit screen with padding for browser UI (address bar, borders)
  // innerHeight already accounts for browser chrome, but we add extra margin for safety
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const canvasWidth = 320;
  const canvasHeight = 480;

  // Reserve space for:
  // - Touch controls at bottom (100-120px)
  // - HUD at top (40px)
  // - Extra padding for browser UI (5% reduction)
  const reservedHeight = 160; // Space for controls and HUD
  const availableHeight = screenHeight - reservedHeight;

  const scaleX = (screenWidth * 0.90) / canvasWidth;  // 90% of width (5% margin each side)
  const scaleY = (availableHeight * 0.95) / canvasHeight; // 95% of available height

  // Use the smaller scale to ensure everything fits
  return Math.min(scaleX, scaleY, 2.0); // Cap at 2.0x for very large screens
};
