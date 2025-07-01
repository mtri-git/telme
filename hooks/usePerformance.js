import { useEffect, useCallback } from 'react';

export const usePerformance = () => {
  // Preload critical resources
  const preloadResources = useCallback(() => {
    if (typeof window === 'undefined') return;

    // Preconnect to API endpoints
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    document.head.appendChild(link);

    // Prefetch critical API calls
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        // Prefetch auth status
        fetch('/api/auth/me', { method: 'HEAD' }).catch(() => {});
      });
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

  // Memory cleanup utilities
  const cleanupListeners = useCallback(() => {
    // Remove any global event listeners that might cause memory leaks
    const events = ['resize', 'scroll', 'beforeunload'];
    events.forEach(event => {
      window.removeEventListener(event, () => {});
    });
  }, []);

  useEffect(() => {
    preloadResources();
    
    return () => {
      cleanupListeners();
    };
  }, [preloadResources, cleanupListeners]);

  return {
    scheduleWork,
    preloadResources,
    cleanupListeners
  };
};

export default usePerformance;
