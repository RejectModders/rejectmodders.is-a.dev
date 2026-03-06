/**
 * Centralized cache configuration for rejectmodders.dev
 * Import revalidation times from here to ensure consistency.
 */

export const cacheConfig = {
  /** Page content: 2 hours */
  page: 7200,
  
  /** API routes (GitHub activity, status): 10 minutes */
  api: 600,
  
  /** Stale-while-revalidate for API: 20 minutes */
  apiStale: 1200,
  
  /** Avatar proxy: 2 hours */
  avatar: 7200,
  
  /** Static assets: 1 year */
  static: 31536000,
  
  /** Dynamic/real-time data: no caching */
  dynamic: 0,
} as const

export type CacheKey = keyof typeof cacheConfig
