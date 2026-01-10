/**
 * Image Optimization System
 *
 * Features:
 * - Automatic image compression
 * - Intelligent caching strategy
 * - Progressive image loading
 * - Image resizing for different screen densities
 * - CDN integration helpers
 * - Memory-efficient loading
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Dimensions, Image, Platform } from 'react-native';
import { LogCategory, logger } from './logger';

export interface ImageOptimizationConfig {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: 'jpeg' | 'png' | 'webp';
  enableCache?: boolean;
  cacheExpiry?: number; // milliseconds
  compressionLevel?: 'low' | 'medium' | 'high';
}

export interface CachedImage {
  uri: string;
  cachedPath: string;
  timestamp: number;
  size: number;
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  format: 'jpeg',
  enableCache: true,
  cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days
  compressionLevel: 'medium',
};

const getCacheDir = (): string => {
  // @ts-ignore - FileSystem types may vary across versions
  return `${FileSystem.cacheDirectory || FileSystem.documentDirectory || ''}optimized-images/`;
};

const CACHE_DIR = getCacheDir();
const CACHE_INDEX_KEY = '@app/image_cache_index';

// Quality presets based on compression level
const QUALITY_PRESETS = {
  low: 0.6,
  medium: 0.8,
  high: 0.95,
};

class ImageOptimizer {
  private cacheIndex: Map<string, CachedImage> = new Map();
  private config: ImageOptimizationConfig;
  private initialized = false;

  constructor(config: Partial<ImageOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Initialize cache directory and load cache index
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Create cache directory if it doesn't exist
      const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
      }

      // Load cache index
      await this.loadCacheIndex();

      // Clean expired cache entries
      await this.cleanExpiredCache();

      this.initialized = true;
      logger.info('Image optimizer initialized', LogCategory.PERFORMANCE);
    } catch (error) {
      logger.error(
        'Failed to initialize image optimizer',
        LogCategory.PERFORMANCE,
        {},
        error as Error
      );
    }
  }

  /**
   * Load cache index from AsyncStorage
   */
  private async loadCacheIndex(): Promise<void> {
    try {
      const indexJson = await AsyncStorage.getItem(CACHE_INDEX_KEY);
      if (indexJson) {
        const indexArray: [string, CachedImage][] = JSON.parse(indexJson);
        this.cacheIndex = new Map(indexArray);
      }
    } catch (error) {
      logger.error('Failed to load cache index', LogCategory.PERFORMANCE, {}, error as Error);
    }
  }

  /**
   * Save cache index to AsyncStorage
   */
  private async saveCacheIndex(): Promise<void> {
    try {
      const indexArray = Array.from(this.cacheIndex.entries());
      await AsyncStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(indexArray));
    } catch (error) {
      logger.error('Failed to save cache index', LogCategory.PERFORMANCE, {}, error as Error);
    }
  }

  /**
   * Generate cache key from URI and config
   */
  private getCacheKey(uri: string, config: ImageOptimizationConfig): string {
    const configStr = JSON.stringify({
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      quality: config.quality,
      format: config.format,
    });
    return `${uri}_${configStr}`;
  }

  /**
   * Get cached file path
   */
  private getCachePath(cacheKey: string): string {
    const hash = this.hashString(cacheKey);
    return `${CACHE_DIR}${hash}.${this.config.format}`;
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Clean expired cache entries
   */
  private async cleanExpiredCache(): Promise<void> {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, cached] of this.cacheIndex.entries()) {
      const cacheExpiry = this.config.cacheExpiry ?? DEFAULT_CONFIG.cacheExpiry ?? 86400000;
      if (now - cached.timestamp > cacheExpiry) {
        expiredKeys.push(key);

        // Delete file
        try {
          await FileSystem.deleteAsync(cached.cachedPath, { idempotent: true });
        } catch (_error) {
          logger.warn('Failed to delete expired cache file', LogCategory.PERFORMANCE, {
            path: cached.cachedPath,
          });
        }
      }
    }

    // Remove from index
    for (const key of expiredKeys) {
      this.cacheIndex.delete(key);
    }

    if (expiredKeys.length > 0) {
      await this.saveCacheIndex();
      logger.info(`Cleaned ${expiredKeys.length} expired cache entries`, LogCategory.PERFORMANCE);
    }
  }

  /**
   * Get optimal image dimensions based on screen size
   */
  private getOptimalDimensions(
    originalWidth: number,
    originalHeight: number,
    config: ImageOptimizationConfig
  ): { width: number; height: number } {
    const screenWidth = Dimensions.get('window').width;
    const pixelRatio = Platform.select({ ios: 2, android: 2, default: 1 });

    const maxWidth = config.maxWidth ?? DEFAULT_CONFIG.maxWidth ?? 1920;
    const maxHeight = config.maxHeight ?? DEFAULT_CONFIG.maxHeight ?? 1920;

    // Adjust for screen size and pixel ratio
    const targetWidth = Math.min(screenWidth * pixelRatio, maxWidth);

    // Calculate aspect ratio
    const aspectRatio = originalWidth / originalHeight;

    let width = targetWidth;
    let height = width / aspectRatio;

    // Ensure height doesn't exceed max
    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width: Math.round(width),
      height: Math.round(height),
    };
  }

  /**
   * Optimize and cache image
   */
  async optimizeImage(
    uri: string,
    options: Partial<ImageOptimizationConfig> = {}
  ): Promise<string> {
    // Ensure initialized
    if (!this.initialized) {
      await this.initialize();
    }

    const config = { ...this.config, ...options };
    const cacheKey = this.getCacheKey(uri, config);

    // Check cache first
    if (config.enableCache && this.cacheIndex.has(cacheKey)) {
      const cached = this.cacheIndex.get(cacheKey);
      if (!cached) {
        throw new Error('Cache entry not found');
      }

      // Verify file still exists
      const fileInfo = await FileSystem.getInfoAsync(cached.cachedPath);
      if (fileInfo.exists) {
        logger.debug('Returning cached image', LogCategory.PERFORMANCE, { uri });
        return cached.cachedPath;
      }
      // File was deleted, remove from index
      this.cacheIndex.delete(cacheKey);
    }

    try {
      // Get image size first
      const imageSize = await this.getImageSize(uri);
      const optimalDimensions = this.getOptimalDimensions(
        imageSize.width,
        imageSize.height,
        config
      );

      // Determine if resizing is needed
      const needsResize =
        imageSize.width > optimalDimensions.width || imageSize.height > optimalDimensions.height;

      // Manipulate image
      const quality = config.quality || QUALITY_PRESETS[config.compressionLevel || 'medium'] || 0.8;

      const manipulationOptions: ImageManipulator.Action[] = [];

      if (needsResize) {
        manipulationOptions.push({
          resize: optimalDimensions,
        });
      }

      const result = await ImageManipulator.manipulateAsync(uri, manipulationOptions, {
        compress: quality,
        format: this.getImageFormat(config.format || 'jpeg'),
      });

      // Cache the result
      if (config.enableCache) {
        const cachePath = this.getCachePath(cacheKey);
        await FileSystem.moveAsync({
          from: result.uri,
          to: cachePath,
        });

        // Get file size
        const fileInfo = await FileSystem.getInfoAsync(cachePath);
        const fileSize = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

        // Add to cache index
        this.cacheIndex.set(cacheKey, {
          uri,
          cachedPath: cachePath,
          timestamp: Date.now(),
          size: fileSize,
        });

        await this.saveCacheIndex();

        logger.info('Image optimized and cached', LogCategory.PERFORMANCE, {
          originalSize: `${imageSize.width}x${imageSize.height}`,
          optimizedSize: `${optimalDimensions.width}x${optimalDimensions.height}`,
          fileSize,
        });

        return cachePath;
      }

      return result.uri;
    } catch (error) {
      logger.error('Failed to optimize image', LogCategory.PERFORMANCE, { uri }, error as Error);
      return uri; // Return original URI on error
    }
  }

  /**
   * Get image format enum
   */
  private getImageFormat(format: string): ImageManipulator.SaveFormat {
    switch (format) {
      case 'png':
        return ImageManipulator.SaveFormat.PNG;
      case 'webp':
        return ImageManipulator.SaveFormat.WEBP;
      default:
        return ImageManipulator.SaveFormat.JPEG;
    }
  }

  /**
   * Get image dimensions
   */
  private async getImageSize(uri: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      Image.getSize(
        uri,
        (width, height) => resolve({ width, height }),
        (error) => reject(error)
      );
    });
  }

  /**
   * Prefetch and optimize multiple images
   */
  async prefetchImages(
    uris: string[],
    options: Partial<ImageOptimizationConfig> = {}
  ): Promise<void> {
    logger.info(`Prefetching ${uris.length} images`, LogCategory.PERFORMANCE);

    const promises = uris.map((uri) => this.optimizeImage(uri, options));
    await Promise.all(promises);

    logger.info(`Prefetched ${uris.length} images`, LogCategory.PERFORMANCE);
  }

  /**
   * Clear all cached images
   */
  async clearCache(): Promise<void> {
    try {
      // Delete cache directory
      await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });

      // Recreate directory
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });

      // Clear index
      this.cacheIndex.clear();
      await AsyncStorage.removeItem(CACHE_INDEX_KEY);

      logger.info('Image cache cleared', LogCategory.PERFORMANCE);
    } catch (error) {
      logger.error('Failed to clear image cache', LogCategory.PERFORMANCE, {}, error as Error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalFiles: number;
    totalSize: number;
    oldestEntry: number | null;
    newestEntry: number | null;
  }> {
    let totalSize = 0;
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    for (const cached of this.cacheIndex.values()) {
      totalSize += cached.size;

      if (oldestEntry === null || cached.timestamp < oldestEntry) {
        oldestEntry = cached.timestamp;
      }

      if (newestEntry === null || cached.timestamp > newestEntry) {
        newestEntry = cached.timestamp;
      }
    }

    return {
      totalFiles: this.cacheIndex.size,
      totalSize,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Generate CDN URL with optimization parameters
   */
  generateCDNUrl(
    baseUrl: string,
    options: {
      width?: number;
      height?: number;
      quality?: number;
      format?: string;
    } = {}
  ): string {
    // Example for Cloudinary-style URLs
    const params: string[] = [];

    if (options.width) params.push(`w_${options.width}`);
    if (options.height) params.push(`h_${options.height}`);
    if (options.quality) params.push(`q_${Math.round(options.quality * 100)}`);
    if (options.format) params.push(`f_${options.format}`);

    if (params.length > 0) {
      // Insert params before filename
      const parts = baseUrl.split('/');
      const filename = parts.pop();
      return `${parts.join('/')}/${params.join(',')}/${filename}`;
    }

    return baseUrl;
  }
}

// Export singleton instance
export const imageOptimizer = new ImageOptimizer();
