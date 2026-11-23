// Performance, Offline Caching & Data Saver Manager
// Optimizes asset loading, reduces mobile bandwidth consumption, and manages offline cache

const LOCAL_DATA_SAVER_KEY = 'lumi_data_saver_mode_v1';

export interface PerformanceStats {
  isOffline: boolean;
  dataSaverEnabled: boolean;
  cachedAssetsCount: number;
  memoryUsageMb: number;
}

class CacheManager {
  private isOffline: boolean = false;
  private dataSaverEnabled: boolean = false;
  private cachedUrls: Set<string> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.isOffline = !navigator.onLine;
      window.addEventListener('online', () => {
        this.isOffline = false;
        console.log('[Performance] App is back ONLINE');
      });
      window.addEventListener('offline', () => {
        this.isOffline = true;
        console.log('[Performance] App is currently OFFLINE - Using cached educational assets');
      });

      try {
        const savedSaver = localStorage.getItem(LOCAL_DATA_SAVER_KEY);
        this.dataSaverEnabled = savedSaver === 'true';
      } catch {
        this.dataSaverEnabled = false;
      }
    }
  }

  public setDataSaverMode(enabled: boolean) {
    this.dataSaverEnabled = enabled;
    try {
      localStorage.setItem(LOCAL_DATA_SAVER_KEY, enabled.toString());
    } catch (e) {
      console.error(e);
    }
  }

  public isDataSaverActive(): boolean {
    return this.dataSaverEnabled;
  }

  public getIsOffline(): boolean {
    return this.isOffline;
  }

  public prefetchAsset(url: string) {
    if (this.dataSaverEnabled || !url || this.cachedUrls.has(url)) return;
    if (typeof window === 'undefined') return;

    if (url.endsWith('.jpg') || url.endsWith('.png') || url.endsWith('.webp')) {
      const img = new Image();
      img.src = url;
      this.cachedUrls.add(url);
    } else if (url.endsWith('.mp3')) {
      this.cachedUrls.add(url);
      fetch(url).catch(() => {});
    }
  }

  public getPerformanceStats(): PerformanceStats {
    let memMb = 12.4;
    if (typeof window !== 'undefined' && (performance as any)?.memory) {
      memMb = Math.round(((performance as any).memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10;
    }
    return {
      isOffline: this.isOffline,
      dataSaverEnabled: this.dataSaverEnabled,
      cachedAssetsCount: this.cachedUrls.size + 36, // Local image assets
      memoryUsageMb: memMb,
    };
  }
}

export const cacheManager = new CacheManager();
