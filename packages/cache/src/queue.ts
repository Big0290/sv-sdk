/**
 * BullMQ queue factory and utilities
 */

import { Queue, Worker, QueueEvents, type QueueOptions, type WorkerOptions, type Job } from 'bullmq'
import { redis } from './client.js'
import { logger } from '@big0290/shared'

/**
 * Get Redis connection options from client
 */
function getRedisConnection() {
  return {
    ...(redis.options.host && { host: redis.options.host }),
    ...(redis.options.port && { port: redis.options.port }),
    ...(redis.options.password && { password: redis.options.password }),
    ...(redis.options.db !== undefined && { db: redis.options.db }),
  }
}

/**
 * Create a new BullMQ queue
 */
export function createQueue<T = unknown>(name: string, options?: Partial<QueueOptions>): Queue<T> {
  const queue = new Queue<T>(name, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
      removeOnComplete: {
        count: 100, // Keep last 100 completed jobs
        age: 24 * 3600, // Keep for 24 hours
      },
      removeOnFail: {
        count: 500, // Keep last 500 failed jobs
        age: 7 * 24 * 3600, // Keep for 7 days
      },
    },
    ...options,
  })

  queue.on('error', (error) => {
    logger.error(`Queue ${name} error`, error)
  })

  logger.info(`Queue created: ${name}`)

  return queue
}

/**
 * Create a new BullMQ worker
 */
export function createWorker<T = unknown>(
  name: string,
  processor: (job: Job<T>) => Promise<unknown>,
  options?: Partial<WorkerOptions>
): Worker<T> {
  const worker = new Worker<T>(name, processor, {
    connection: getRedisConnection(),
    concurrency: 5,
    ...options,
  })

  worker.on('completed', (job) => {
    logger.debug(`Job ${job.id} in queue ${name} completed`)
  })

  worker.on('failed', (job, error) => {
    logger.error(`Job ${job?.id} in queue ${name} failed`, error)
  })

  worker.on('error', (error) => {
    logger.error(`Worker ${name} error`, error)
  })

  logger.info(`Worker created: ${name}`)

  return worker
}

/**
 * Create queue events listener
 */
export function createQueueEvents(name: string): QueueEvents {
  const queueEvents = new QueueEvents(name, {
    connection: getRedisConnection(),
  })

  queueEvents.on('error', (error) => {
    logger.error(`QueueEvents ${name} error`, error)
  })

  return queueEvents
}

/**
 * Get queue metrics
 */
export async function getQueueMetrics(queue: Queue) {
  try {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
    ])

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      total: waiting + active + completed + failed + delayed,
    }
  } catch (error) {
    logger.error('Failed to get queue metrics', error as Error)
    throw error
  }
}

/**
 * Clean old jobs from queue
 */
export async function cleanQueue(
  queue: Queue,
  options: {
    grace?: number // Grace period in milliseconds
    limit?: number // Max number of jobs to clean
    status?: 'completed' | 'failed'
  } = {}
): Promise<string[]> {
  try {
    const { grace = 24 * 3600 * 1000, limit = 1000, status = 'completed' } = options

    const jobs = await queue.clean(grace, limit, status)
    logger.info(`Cleaned ${jobs.length} ${status} jobs from queue ${queue.name}`)

    return jobs
  } catch (error) {
    logger.error('Failed to clean queue', error as Error)
    throw error
  }
}

/**
 * Pause queue
 */
export async function pauseQueue(queue: Queue): Promise<void> {
  try {
    await queue.pause()
    logger.info(`Queue ${queue.name} paused`)
  } catch (error) {
    logger.error('Failed to pause queue', error as Error)
    throw error
  }
}

/**
 * Resume queue
 */
export async function resumeQueue(queue: Queue): Promise<void> {
  try {
    await queue.resume()
    logger.info(`Queue ${queue.name} resumed`)
  } catch (error) {
    logger.error('Failed to resume queue', error as Error)
    throw error
  }
}

/**
 * Drain queue (remove all jobs)
 */
export async function drainQueue(queue: Queue): Promise<void> {
  try {
    await queue.drain()
    logger.warn(`Queue ${queue.name} drained - all jobs removed`)
  } catch (error) {
    logger.error('Failed to drain queue', error as Error)
    throw error
  }
}

/**
 * Close queue connection
 */
export async function closeQueue(queue: Queue): Promise<void> {
  try {
    await queue.close()
    logger.info(`Queue ${queue.name} closed`)
  } catch (error) {
    logger.error('Failed to close queue', error as Error)
    throw error
  }
}

/**
 * Close worker connection
 */
export async function closeWorker(worker: Worker): Promise<void> {
  try {
    await worker.close()
    logger.info(`Worker ${worker.name} closed`)
  } catch (error) {
    logger.error('Failed to close worker', error as Error)
    throw error
  }
}

// Export BullMQ types for convenience
export { Queue, Worker, QueueEvents, type Job, type QueueOptions, type WorkerOptions }
