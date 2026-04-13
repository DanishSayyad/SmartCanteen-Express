import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { CacheProvider } from '../../interfaces/cache-provider.js';

class InMemoryCacheProvider implements CacheProvider {
  private readonly store = new Map<string, { expiresAt?: number; value: unknown }>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    });
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }
}

type CacheEntry = {
  expiresAt?: number;
  value: unknown;
};

class LocalFileCacheProvider implements CacheProvider {
  private readonly cacheFilePath = resolve(process.cwd(), '.cache', 'smart-canteen-cache.json');
  private readonly store = new Map<string, CacheEntry>();
  private loaded = false;
  private loadingPromise: Promise<void> | null = null;

  private async loadStore(): Promise<void> {
    if (this.loaded) {
      return;
    }

    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    this.loadingPromise = (async () => {
      try {
        const rawContent = await readFile(this.cacheFilePath, 'utf8');
        const parsed = JSON.parse(rawContent) as Record<string, CacheEntry>;
        const now = Date.now();

        for (const [key, entry] of Object.entries(parsed)) {
          if (entry.expiresAt && entry.expiresAt <= now) {
            continue;
          }

          this.store.set(key, entry);
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.error('Local cache load failed, starting empty cache:', error);
        }
      } finally {
        this.loaded = true;
        this.loadingPromise = null;
      }
    })();

    await this.loadingPromise;
  }

  private async persistStore(): Promise<void> {
    await mkdir(dirname(this.cacheFilePath), { recursive: true });
    const payload = JSON.stringify(Object.fromEntries(this.store.entries()), null, 2);
    await writeFile(this.cacheFilePath, payload, 'utf8');
  }

  private pruneExpiredEntry(key: string, entry: CacheEntry) {
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return true;
    }

    return false;
  }

  async get<T>(key: string): Promise<T | null> {
    await this.loadStore();

    const entry = this.store.get(key);
    if (!entry) {
      return null;
    }

    if (this.pruneExpiredEntry(key, entry)) {
      await this.persistStore();
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    await this.loadStore();
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined
    });
    await this.persistStore();
  }

  async del(key: string): Promise<void> {
    await this.loadStore();
    if (this.store.delete(key)) {
      await this.persistStore();
    }
  }
}

const createCacheProvider = (): CacheProvider => {
  return new LocalFileCacheProvider();
};

export const cacheProvider = createCacheProvider();

export const cacheKeys = {
  cart: (tenantId: string, userId: string) => `cart:${tenantId}:${userId}`,
  qr: (tenantId: string, orderId: string) => `qr:${tenantId}:${orderId}`
};
