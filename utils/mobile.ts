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

  // Mobile: scale to fit screen width with some padding
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const canvasWidth = 320;
  const canvasHeight = 480;

  const scaleX = (screenWidth * 0.95) / canvasWidth;
  const scaleY = (screenHeight * 0.7) / canvasHeight;

  return Math.min(scaleX, scaleY);
};
