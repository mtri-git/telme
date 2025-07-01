class PreloadService {
  constructor() {
    this.cache = new Map();
    this.preloadPromises = new Map();
  }

  // Preload authentication data
  async preloadAuth() {
    if (this.preloadPromises.has('auth')) {
      return this.preloadPromises.get('auth');
    }

    const authPromise = import('@/services/authService')
      .then(module => module.default.getMe())
      .catch(() => null);

    this.preloadPromises.set('auth', authPromise);
    return authPromise;
  }

  // Preload room data
  async preloadRooms() {
    if (this.preloadPromises.has('rooms')) {
      return this.preloadPromises.get('rooms');
    }

    const roomsPromise = import('@/utils/axios')
      .then(axios => axios.default.get('/rooms/for-user'))
      .catch(() => ({ data: { data: [] } }));

    this.preloadPromises.set('rooms', roomsPromise);
    return roomsPromise;
  }

  // Cache frequently used data
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: 5 * 60 * 1000 // 5 minutes
    });
  }

  getCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  // Preload critical resources
  preloadCriticalResources() {
    if (typeof window === 'undefined') return;

    // Preload components that will likely be needed
    const criticalImports = [
      () => import('@/components/base/sidebar'),
      () => import('@/components/base/chatWindow'),
      () => import('@/components/base/messageItem')
    ];

    // Use requestIdleCallback for non-blocking preloads
    if ('requestIdleCallback' in window) {
      criticalImports.forEach(importFn => {
        window.requestIdleCallback(() => {
          importFn().catch(() => {});
        });
      });
    }
  }
}

export default new PreloadService();
