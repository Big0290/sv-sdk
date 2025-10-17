/**
 * Cache package
 * Export Redis client, cache utilities, queue system, and health checks
 */

// Redis client
export { redis, closeRedisConnection, getRedisStatus } from './client.js'

// Cache utilities
export {
  cacheGet,
  cacheSet,
  cacheDelete,
  cacheDeletePattern,
  cacheExists,
  cacheTTL,
  cacheExpire,
  cacheIncrement,
  cacheDecrement,
  cacheMultiGet,
  cacheMultiSet,
  cacheFlush,
} from './cache-utils.js'

// Queue system
export {
  createQueue,
  createWorker,
  createQueueEvents,
  getQueueMetrics,
  cleanQueue,
  pauseQueue,
  resumeQueue,
  drainQueue,
  closeQueue,
  closeWorker,
  Queue,
  Worker,
  QueueEvents,
  type Job,
  type QueueOptions,
  type WorkerOptions,
} from './queue.js'

// Configuration
export { CACHE_TTL, CACHE_PREFIX, CACHE_KEYS, QUEUE_NAMES, QUEUE_PRIORITY } from './config.js'

// Health checks
export { checkRedisHealth, checkRedisHealthDetailed, pingRedis, type RedisHealthResult } from './health.js'
