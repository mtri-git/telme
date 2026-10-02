import { useEffect, useCallback } from 'react';

export const usePerformance = () => {
  // Preconnect to the API and socket servers to save a round trip on first request
  const preloadResources = useCallback(() => {
    if (typeof window === 'undefined') return;

    const origins = [process.env.NEXT_PUBLIC_API_BASE_URL, process.env.NEXT_PUBLIC_SOCKET_URL];
    for (const href of new Set(origins.filter(Boolean))) {
      if (document.head.querySelector(`link[rel="preconnect"][href="${href}"]`)) continue;
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = href;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
  }, []);

  // Optimize rendering with frame scheduling
  const scheduleWork = useCallback((callback) => {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(callback, { timeout: 5000 });
    } else if ('requestAnimationFrame' in window) {
      return window.requestAnimationFrame(() => {
        window.setTimeout(callback, 0);
      });
    } else {
      return window.setTimeout(callback, 0);
    }
  }, []);

  useEffect(() => {
    preloadResources();
  }, [preloadResources]);

  return {
    scheduleWork,
    preloadResources,
  };
};

export default usePerformance;
