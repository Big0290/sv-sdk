/**
 * Observability package
 * Export metrics, health checks, and monitoring integrations
 */

// Metrics
export {
  metricsCollector,
  trackRequestLatency,
  trackError,
  trackQueueDepth,
  trackEmailSend,
  trackDatabasePool,
  trackCacheHit,
  type Metric,
  type MetricType,
} from './metrics/collector.js'

export {
  MetricsReporter,
  createMetricsReporter,
  defaultReporter,
  type ReporterConfig,
} from './metrics/reporter.js'

// Health probes
export { livenessProbe, readinessProbe, startupProbe, createProbeHandlers } from './health/probes.js'

