// src/utils/apiHelper.js

// Current API requests lack caching and optimization. This module provides enhanced fetching with client-side caching using Map for faster subsequent requests.

// In-memory cache for API responses
const apiCache = new Map();
const cacheTimestamps = new Map();

// Cache duration in milliseconds
const CACHE_DURATION = {
  dashboard: 60000,    // 1 minute
  analytics: 120000,   // 2 minutes  
  static: 300000,      // 5 minutes for relatively static data
  real_time: 30000     // 30 seconds for real-time data
};

/**
 * Safely parses a fetch response as JSON, handling cases where the response
 * might be HTML (like error pages) instead of JSON.
 * 
 * @param {Response} response - The fetch response object
 * @returns {Promise<{success: boolean, data?: any, error: string}>}
 */
export async function safeFetchJson(response) {
  try {
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      // Try to parse error response as JSON
      try {
        const errorData = await response.json();
        return { 
          success: false, 
          error: errorData.error || errorData.message || 'Unknown error' 
        };
      } catch (parseError) {
        // If response is not JSON (e.g., HTML error page), use status text
        return { 
          success: false, 
          error: response.statusText || `HTTP ${response.status}` 
        };
      }
    }
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Network error' 
    };
  }
}

/**
 * Enhanced fetch wrapper with intelligent caching
 * 
 * @param {string} url - The URL to fetch
 * @param {RequestInit} options - Fetch options
 * @param {string} cacheType - Type of cache duration to use
 * @returns {Promise<{success: boolean, data?: any, error?: string, response: Response, fromCache: boolean}>}
 */
export async function apiRequest(url, options = {}, cacheType = 'static') {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  const now = Date.now();
  const cacheDuration = CACHE_DURATION[cacheType] || CACHE_DURATION.static;
  
  // Check if we have cached data that's still valid
  if (options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
    const cachedData = apiCache.get(cacheKey);
    const cacheTime = cacheTimestamps.get(cacheKey);
    
    if (cachedData && cacheTime && (now - cacheTime) < cacheDuration) {
      return { ...cachedData, fromCache: true };
    }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const result = await safeFetchJson(response);
    const finalResult = { ...result, response, fromCache: false };
    
    // Cache successful GET requests
    if (result.success && (!options.method || options.method === 'GET')) {
      apiCache.set(cacheKey, finalResult);
      cacheTimestamps.set(cacheKey, now);
      
      // Clean old cache entries to prevent memory leaks
      if (apiCache.size > 100) {
        const oldestKey = Array.from(cacheTimestamps.entries())
          .sort(([,a], [,b]) => a - b)[0][0];
        apiCache.delete(oldestKey);
        cacheTimestamps.delete(oldestKey);
      }
    }
    
    return finalResult;
  } catch (error) {
    return { 
      success: false, 
      error: error.message || 'Network error',
      response: null,
      fromCache: false
    };
  }
}

/**
 * Parallel fetch for multiple resources simultaneously to minimize wait times
 * 
 * @param {Array} requests - Array of {url, options, cacheType} objects
 * @returns {Promise<Array>} Array of results
 */
export async function parallelApiRequests(requests) {
  return Promise.all(
    requests.map(({ url, options = {}, cacheType = 'static' }) => 
      apiRequest(url, options, cacheType)
    )
  );
}

/**
 * Clear cache for specific URL pattern or all cache
 * 
 * @param {string} pattern - URL pattern to clear (optional)
 */
export function clearApiCache(pattern = null) {
  if (pattern) {
    for (const key of apiCache.keys()) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
        cacheTimestamps.delete(key);
      }
    }
  } else {
    apiCache.clear();
    cacheTimestamps.clear();
  }
}

/**
 * Preload critical data for faster page transitions
 * 
 * @param {Array} urls - URLs to preload
 * @param {Object} options - Preloading options
 */
export async function preloadCriticalData(urls, options = {}) {
  const { 
    batchSize = 3,
    timeout = 5000,
    priority = 'high'
  } = options;

  // Process URLs in batches to avoid overwhelming the server
  const batches = [];
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }

  const results = [];

  for (const batch of batches) {
    const preloadPromises = batch.map(async (url) => {
      try {
        // Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' }
        });
        
        let data = null;
        if (response.ok) {
          data = await response.json();
          // Cache in memory
          apiCache.set(url, { success: true, data });
          cacheTimestamps.set(url, Date.now());
        }

        clearTimeout(timeoutId);
        
        return { url, success: true, data };
      } catch (error) {
        console.warn(`Preload failed for ${url}:`, error.message);
        return { url, success: false, error: error.message };
      }
    });

    const batchResults = await Promise.allSettled(preloadPromises);
    results.push(...batchResults.map(result => result.value || result.reason));
    
    // Small delay between batches to prevent overwhelming
    if (batches.indexOf(batch) < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return results;
}

/**
 * Smart fetch with automatic caching and retry logic
 */
export async function smartFetch(url, options = {}) {
  const {
    useCache = true,
    maxRetries = 2,
    retryDelay = 1000
  } = options;

  // Check memory cache first for immediate response
  if (useCache) {
    const cached = apiCache.get(url);
    const timestamp = cacheTimestamps.get(url);
    
    if (cached && timestamp && (Date.now() - timestamp) < CACHE_DURATION.static) {
      return { ...cached, fromCache: true };
    }
  }

  // Network fetch with retry logic
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      const result = await safeFetchJson(response);
      
      if (result.success && useCache) {
        // Update cache
        const cacheResult = { ...result, fromCache: false };
        apiCache.set(url, cacheResult);
        cacheTimestamps.set(url, Date.now());
      }

      return { ...result, fromCache: false };
    } catch (error) {
      if (attempt === maxRetries) {
        return { success: false, error: error.message };
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
    }
  }
}
