// Cache manager for optimizing API calls and reducing server load
export class CacheManager {
  private static instance: CacheManager;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private requestPromises: Map<string, Promise<any>> = new Map();

  static getInstance(): CacheManager {
    if (!CacheManager.instance) {
      CacheManager.instance = new CacheManager();
    }
    return CacheManager.instance;
  }

  // Get cached data or execute fetcher if cache is stale/missing
  async get<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number = 5 * 60 * 1000 // Default 5 minutes TTL
  ): Promise<T> {
    const now = Date.now();
    const cached = this.cache.get(key);

    // Return cached data if valid
    if (cached && (now - cached.timestamp) < cached.ttl) {
      console.log(`📋 Cache HIT for ${key}`);
      return cached.data;
    }

    // Check if request is already in progress (deduplication)
    const existingPromise = this.requestPromises.get(key);
    if (existingPromise) {
      console.log(`⏳ Deduplicating request for ${key}`);
      return existingPromise;
    }

    // Execute fetcher and cache result
    console.log(`📋 Cache MISS for ${key} - fetching fresh data`);
    const promise = fetcher().then(data => {
      this.cache.set(key, {
        data,
        timestamp: now,
        ttl
      });
      this.requestPromises.delete(key);
      return data;
    }).catch(error => {
      this.requestPromises.delete(key);
      throw error;
    });

    this.requestPromises.set(key, promise);
    return promise;
  }

  // Manually set cache entry
  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
    console.log(`📋 Cached ${key} with ${ttl}ms TTL`);
  }

  // Invalidate specific cache entry
  invalidate(key: string): void {
    this.cache.delete(key);
    this.requestPromises.delete(key);
    console.log(`📋 Invalidated cache for ${key}`);
  }

  // Invalidate multiple cache entries by prefix
  invalidateByPrefix(prefix: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.invalidate(key);
    }

    console.log(`📋 Invalidated ${keysToDelete.length} cache entries with prefix: ${prefix}`);
  }

  // Clear all cache
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.requestPromises.clear();
    console.log(`📋 Cleared all ${size} cache entries`);
  }

  // Get cache statistics for debugging
  getStats(): { 
    totalEntries: number; 
    activeRequests: number; 
    memoryUsage: string;
  } {
    return {
      totalEntries: this.cache.size,
      activeRequests: this.requestPromises.size,
      memoryUsage: `${Math.round(JSON.stringify([...this.cache.entries()]).length / 1024)}KB`
    };
  }

  // Clean up expired entries (garbage collection)
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if ((now - entry.timestamp) >= entry.ttl) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(`📋 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  // Automatically cleanup every 10 minutes
  startAutoCleanup(): void {
    setInterval(() => this.cleanup(), 10 * 60 * 1000);
    console.log('📋 Started automatic cache cleanup (every 10 minutes)');
  }
}

// Initialize auto cleanup
if (typeof window !== 'undefined') {
  CacheManager.getInstance().startAutoCleanup();
}

// Cache keys constants for consistency
export const CACHE_KEYS = {
  USER_PREFERENCES: (userId: string) => `preferences:${userId}`,
  FILTERS: 'api:filters',
  TEAM_COLORS: 'api:team-colors',
  EXCHANGE_RATE: 'api:exchange-rate',
  DATA_TABLE: (params: string) => `api:data:${params}`,
  ADSER_DATA: (params: string) => `api:adser:${params}`,
  OVERVIEW_DATA: (params: string) => `api:overview:${params}`,
  DAILY_DEPOSITS: (month: number, year: number) => `api:daily-deposits:${year}-${month}`,
} as const;