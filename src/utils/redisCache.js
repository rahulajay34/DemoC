// Enhanced caching system with memory fallback and intelligent cache invalidation
"use client";

// In-memory cache as fallback for Redis
class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.ttls = new Map();
  }

  set(key, value, ttl = 3600) {
    this.cache.set(key, value);
    this.ttls.set(key, Date.now() + (ttl * 1000));
    return Promise.resolve('OK');
  }

  get(key) {
    const ttl = this.ttls.get(key);
    if (ttl && Date.now() > ttl) {
      this.cache.delete(key);
      this.ttls.delete(key);
      return Promise.resolve(null);
    }
    return Promise.resolve(this.cache.get(key) || null);
  }

  del(key) {
    this.cache.delete(key);
    this.ttls.delete(key);
    return Promise.resolve(1);
  }

  clear() {
    this.cache.clear();
    this.ttls.clear();
    return Promise.resolve('OK');
  }
}

// Initialize cache (memory fallback if Redis not available)
let cache;
try {
  // Try to use Redis if available (you can add Redis here later)
  cache = new MemoryCache();
} catch (error) {
  cache = new MemoryCache();
}

// Smart cache key generation
export function generateCacheKey(endpoint, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});
  
  return `api:${endpoint}:${JSON.stringify(sortedParams)}`;
}

// Get cached data with automatic parsing
export async function getCachedData(key) {
  try {
    const cached = await cache.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn('Cache get error:', error);
    return null;
  }
}

// Set cached data with automatic serialization
export async function setCachedData(key, data, ttl = 3600) {
  try {
    await cache.set(key, JSON.stringify(data), ttl);
    return true;
  } catch (error) {
    console.warn('Cache set error:', error);
    return false;
  }
}

// Invalidate related cache entries
export async function invalidateCache(pattern) {
  try {
    if (pattern.includes('*')) {
      // For memory cache, we need to iterate through keys
      if (cache instanceof MemoryCache) {
        const keysToDelete = [];
        for (const key of cache.cache.keys()) {
          const regex = new RegExp(pattern.replace('*', '.*'));
          if (regex.test(key)) {
            keysToDelete.push(key);
          }
        }
        for (const key of keysToDelete) {
          await cache.del(key);
        }
      }
    } else {
      await cache.del(pattern);
    }
    return true;
  } catch (error) {
    console.warn('Cache invalidation error:', error);
    return false;
  }
}

// Cache warming for critical data
export async function warmCache() {
  const criticalEndpoints = [
    { endpoint: '/api/dashboard', params: { period: 'monthly' } },
    { endpoint: '/api/riders', params: { limit: 10, page: 1 } },
    { endpoint: '/api/bikes', params: { limit: 10, page: 1 } },
    { endpoint: '/api/assignments', params: { limit: 10, page: 1 } },
  ];

  const warmPromises = criticalEndpoints.map(async ({ endpoint, params }) => {
    try {
      const response = await fetch(`${endpoint}?${new URLSearchParams(params)}`);
      if (response.ok) {
        const data = await response.json();
        const cacheKey = generateCacheKey(endpoint, params);
        await setCachedData(cacheKey, data, 1800); // 30 minutes
      }
    } catch (error) {
      console.warn(`Cache warming failed for ${endpoint}:`, error);
    }
  });

  await Promise.allSettled(warmPromises);
}

// Advanced caching strategies
export const CacheStrategies = {
  CACHE_FIRST: 'cache-first',
  NETWORK_FIRST: 'network-first',
  CACHE_ONLY: 'cache-only',
  NETWORK_ONLY: 'network-only'
};

// Smart fetch with caching strategy
export async function fetchWithCache(url, options = {}) {
  const {
    strategy = CacheStrategies.CACHE_FIRST,
    ttl = 3600,
    revalidate = false
  } = options;

  const cacheKey = generateCacheKey(url, options.params || {});

  switch (strategy) {
    case CacheStrategies.CACHE_FIRST:
      const cached = await getCachedData(cacheKey);
      if (cached && !revalidate) {
        return cached;
      }
      
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          await setCachedData(cacheKey, data, ttl);
          return data;
        }
        return cached || null;
      } catch (error) {
        return cached || null;
      }

    case CacheStrategies.NETWORK_FIRST:
      try {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          await setCachedData(cacheKey, data, ttl);
          return data;
        }
      } catch (error) {
        const cached = await getCachedData(cacheKey);
        if (cached) return cached;
        throw error;
      }
      break;

    case CacheStrategies.CACHE_ONLY:
      return await getCachedData(cacheKey);

    case CacheStrategies.NETWORK_ONLY:
      const response = await fetch(url);
      return response.json();

    default:
      return await getCachedData(cacheKey);
  }
}

export default {
  get: getCachedData,
  set: setCachedData,
  invalidate: invalidateCache,
  generateKey: generateCacheKey,
  warm: warmCache,
  fetchWithCache,
  strategies: CacheStrategies
};
