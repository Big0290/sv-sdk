/**
 * Email package
 * Export email service, templates, providers, queue, and webhooks
 */

// Email service
export { sendEmail, sendEmailImmediate, getEmailHistory, getEmailStats, testTemplate } from './email-service.js'

// Template renderer
export {
  renderTemplate,
  validateTemplateMJML,
  previewTemplate,
  registerTemplateHelpers,
  getTemplateSchema,
  TEMPLATE_SCHEMAS,
  type RenderedEmail,
} from './renderer.js'

// Queue
export { enqueueEmail, emailQueue, emailWorker, type EmailJob } from './queue.js'

// Webhooks
export { processWebhook, getUnprocessedWebhooks, retryWebhookProcessing } from './webhooks.js'

// Providers
export { getEmailProvider, type EmailProvider, type EmailMessage, type EmailResult, type WebhookEvent } from './providers/index.js'

