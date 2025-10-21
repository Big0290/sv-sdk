/**
 * Metrics reporter
 * Periodically reports metrics to monitoring systems
 */

import { metricsCollector, type Metric } from './collector.js'
import { logger } from '@big0290/shared'

/**
 * Reporter configuration
 */
export interface ReporterConfig {
  /**
   * Reporting interval in milliseconds
   */
  interval: number

  /**
   * Enable console reporting
   */
  console?: boolean

  /**
   * Custom reporter function
   */
  reporter?: (metrics: Metric[]) => Promise<void>
}

/**
 * Metrics reporter
 */
export class MetricsReporter {
  private interval: NodeJS.Timeout | null = null
  private config: ReporterConfig

  constructor(config: ReporterConfig) {
    this.config = config
  }

  /**
   * Start reporting metrics
   */
  start(): void {
    if (this.interval) {
      logger.warn('Metrics reporter already started')
      return
    }

    logger.info('Starting metrics reporter', { interval: this.config.interval })

    this.interval = setInterval(async () => {
      await this.report()
    }, this.config.interval)
  }

  /**
   * Stop reporting metrics
   */
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      logger.info('Metrics reporter stopped')
    }
  }

  /**
   * Report metrics once
   */
  async report(): Promise<void> {
    try {
      const metrics = metricsCollector.getAllMetrics()

      if (metrics.length === 0) {
        return
      }

      // Console reporting
      if (this.config.console) {
        logger.info('Metrics Report', { count: metrics.length })

        metrics.forEach((metric) => {
          const labels = metric.labels
            ? ` {${Object.entries(metric.labels)
                .map(([k, v]) => `${k}="${v}"`)
                .join(',')}}`
            : ''

          logger.info(`  ${metric.name}${labels}: ${metric.value}`)
        })
      }

      // Custom reporter
      if (this.config.reporter) {
        await this.config.reporter(metrics)
      }
    } catch (error) {
      logger.error('Metrics reporting failed', error as Error)
    }
  }
}

/**
 * Create metrics reporter
 */
export function createMetricsReporter(config: Partial<ReporterConfig> = {}): MetricsReporter {
  return new MetricsReporter({
    interval: config.interval || 60000, // Default: 1 minute
    console: config.console ?? process.env.NODE_ENV === 'development',
    reporter: config.reporter,
  })
}

/**
 * Default metrics reporter
 */
export const defaultReporter = createMetricsReporter()
