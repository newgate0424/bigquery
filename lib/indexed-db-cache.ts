// IndexedDB cache for client-side data storage
class IndexedDBCache {
  private static instance: IndexedDBCache;
  private db: IDBDatabase | null = null;
  private dbName = 'BigQueryDashboardCache';
  private version = 1;
  private storeName = 'cacheStore';

  private constructor() {
    this.initDB();
  }

  static getInstance(): IndexedDBCache {
    if (!IndexedDBCache.instance) {
      IndexedDBCache.instance = new IndexedDBCache();
    }
    return IndexedDBCache.instance;
  }

  private async initDB(): Promise<void> {
    if (typeof window === 'undefined') return; // Skip on server

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        console.error('IndexedDB failed to open:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('📦 IndexedDB cache initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('ttl', 'ttl', { unique: false });
        }
      };
    });
  }

  async set(key: string, data: any, ttl: number = 5 * 60 * 1000): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    const entry = {
      key,
      data,
      timestamp: Date.now(),
      ttl,
      expiresAt: Date.now() + ttl
    };

    return new Promise((resolve, reject) => {
      const request = store.put(entry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async get(key: string): Promise<any | null> {
    if (!this.db) return null;

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      
      request.onsuccess = () => {
        const entry = request.result;
        
        if (!entry) {
          resolve(null);
          return;
        }

        // Check if entry has expired
        if (Date.now() > entry.expiresAt) {
          console.log('📦 IndexedDB cache entry expired for:', key);
          this.delete(key); // Clean up expired entry
          resolve(null);
          return;
        }

        console.log('📦 IndexedDB cache HIT for:', key);
        resolve(entry.data);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async delete(key: string): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clear(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => {
        console.log('📦 IndexedDB cache cleared');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async cleanup(): Promise<void> {
    if (!this.db) return;

    const transaction = this.db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const now = Date.now();

    const request = store.openCursor();
    let cleanedCount = 0;

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        
        if (cursor) {
          const entry = cursor.value;
          
          // Delete expired entries
          if (now > entry.expiresAt) {
            cursor.delete();
            cleanedCount++;
          }
          
          cursor.continue();
        } else {
          if (cleanedCount > 0) {
            console.log(`📦 IndexedDB cleaned up ${cleanedCount} expired entries`);
          }
          resolve();
        }
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // Get cache statistics
  async getStats(): Promise<{
    totalEntries: number;
    expiredEntries: number;
    totalSize: string;
  }> {
    if (!this.db) return { totalEntries: 0, expiredEntries: 0, totalSize: '0KB' };

    const transaction = this.db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const now = Date.now();

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      
      request.onsuccess = () => {
        const entries = request.result;
        let expiredEntries = 0;
        let totalSize = 0;
        
        entries.forEach(entry => {
          if (now > entry.expiresAt) {
            expiredEntries++;
          }
          totalSize += JSON.stringify(entry).length;
        });

        resolve({
          totalEntries: entries.length,
          expiredEntries,
          totalSize: `${Math.round(totalSize / 1024)}KB`
        });
      };
      
      request.onerror = () => reject(request.error);
    });
  }
}

// Initialize cleanup on startup
if (typeof window !== 'undefined') {
  // Clean up expired entries every 30 minutes
  setInterval(() => {
    IndexedDBCache.getInstance().cleanup();
  }, 30 * 60 * 1000);
}

export default IndexedDBCache;

// Enhanced fetch function with IndexedDB caching
export async function cachedFetch(
  url: string, 
  options: RequestInit = {}, 
  ttl: number = 5 * 60 * 1000
): Promise<any> {
  const cache = IndexedDBCache.getInstance();
  const cacheKey = `fetch:${url}:${JSON.stringify(options)}`;

  // Try to get from cache first
  const cachedData = await cache.get(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  // Fetch fresh data
  console.log('📡 Fetching fresh data from:', url);
  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  // Cache the result
  await cache.set(cacheKey, data, ttl);
  console.log('📦 Cached response for:', url);
  
  return data;
}