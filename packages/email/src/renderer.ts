/**
 * Email template renderer
 * Compiles MJML templates with Handlebars variables
 */

import mjml2html from 'mjml'
import Handlebars from 'handlebars'
import { convert } from 'html-to-text'
import { db, emailTemplates } from '@sv-sdk/db-config'
import { eq, and } from '@sv-sdk/db-config'
import { cacheGet, cacheSet, CACHE_KEYS, CACHE_TTL } from '@sv-sdk/cache'
import { ValidationError, NotFoundError, logger } from '@sv-sdk/shared'
import { z } from 'zod'

/**
 * Rendered email result
 */
export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

/**
 * Template variable schemas
 * Define expected variables for each template
 */
export const TEMPLATE_SCHEMAS = {
  verification_email: z.object({
    userName: z.string(),
    verificationUrl: z.string().url(),
  }),

  password_reset: z.object({
    userName: z.string(),
    resetUrl: z.string().url(),
    expiresIn: z.string(),
  }),

  invite: z.object({
    inviterName: z.string(),
    inviteUrl: z.string().url(),
    organizationName: z.string(),
  }),

  notification: z.object({
    subject: z.string(),
    title: z.string(),
    message: z.string(),
    actionUrl: z.string().url().optional(),
    actionText: z.string().optional(),
  }),

  marketing: z.object({
    userName: z.string(),
    subject: z.string(),
    content: z.string(),
    unsubscribeUrl: z.string().url(),
  }),
} as const

/**
 * Get template schema by name
 */
export function getTemplateSchema(templateName: string): z.ZodSchema | null {
  return TEMPLATE_SCHEMAS[templateName as keyof typeof TEMPLATE_SCHEMAS] || null
}

/**
 * Fetch template from database (with caching)
 */
async function fetchTemplate(
  name: string,
  locale: string = 'en'
): Promise<{
  subject: string
  mjml: string
  variables: string[]
} | null> {
  try {
    // Check cache
    const cacheKey = CACHE_KEYS.emailTemplate(name, locale)
    const cached = await cacheGet<{ subject: string; mjml: string; variables: string[] }>(cacheKey)

    if (cached) {
      logger.debug('Template fetched from cache', { name, locale })
      return cached
    }

    // Query database
    const result = await db
      .select()
      .from(emailTemplates)
      .where(and(eq(emailTemplates.name, name), eq(emailTemplates.locale, locale), eq(emailTemplates.isActive, true)))
      .limit(1)

    if (result.length === 0) {
      // Try fallback to English if locale not found
      if (locale !== 'en') {
        logger.debug('Template not found for locale, trying English', { name, locale })
        return fetchTemplate(name, 'en')
      }

      return null
    }

    const templateData = result[0]
    if (!templateData) {
      return null
    }

    const template = {
      subject: templateData.subject,
      mjml: templateData.mjml,
      variables: templateData.variables as string[],
    }

    // Cache template
    await cacheSet(cacheKey, template, CACHE_TTL.LONG)

    logger.debug('Template fetched from database', { name, locale })

    return template
  } catch (error) {
    logger.error('Failed to fetch template', error as Error, { name, locale })
    return null
  }
}

/**
 * Render email template
 */
export async function renderTemplate(
  templateName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: Record<string, any>,
  locale: string = 'en'
): Promise<RenderedEmail> {
  try {
    // 1. Fetch template
    const template = await fetchTemplate(templateName, locale)

    if (!template) {
      throw new NotFoundError('Email template not found', {
        resource: 'email_template',
        resourceId: templateName,
      })
    }

    // 2. Validate variables
    const schema = getTemplateSchema(templateName)

    if (schema) {
      const validation = schema.safeParse(variables)

      if (!validation.success) {
        throw new ValidationError('Invalid template variables', {
          errors: validation.error.errors.map((err: { path: (string | number)[]; message: string }) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        })
      }
    }

    // 3. Compile subject with Handlebars
    const subjectTemplate = Handlebars.compile(template.subject)
    const subject = subjectTemplate(variables)

    // 4. Compile MJML with Handlebars
    const mjmlTemplate = Handlebars.compile(template.mjml)
    const mjmlContent = mjmlTemplate(variables)

    // 5. Compile MJML to HTML
    const mjmlResult = mjml2html(mjmlContent, {
      validationLevel: 'strict',
      minify: true,
    })

    if (mjmlResult.errors.length > 0) {
      logger.error('MJML compilation errors', undefined, { errors: mjmlResult.errors })

      throw new ValidationError('MJML compilation failed', {
        details: { errors: mjmlResult.errors },
      })
    }

    const html = mjmlResult.html

    // 6. Generate plain text version
    const text = convert(html, {
      wordwrap: 80,
      selectors: [
        { selector: 'a', options: { ignoreHref: false } },
        { selector: 'img', format: 'skip' },
      ],
    })

    logger.debug('Template rendered successfully', { templateName, locale })

    return {
      subject,
      html,
      text,
    }
  } catch (error) {
    logger.error('Failed to render template', error as Error, { templateName, locale })
    throw error
  }
}

/**
 * Validate template MJML
 * Returns validation errors if any
 */
export function validateTemplateMJML(mjml: string): {
  valid: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  errors: any[]
} {
  try {
    const result = mjml2html(mjml, {
      validationLevel: 'strict',
    })

    return {
      valid: result.errors.length === 0,
      errors: result.errors,
    }
  } catch (error) {
    return {
      valid: false,
      errors: [{ message: error instanceof Error ? error.message : 'Unknown error' }],
    }
  }
}

/**
 * Preview template with sample variables
 */
export async function previewTemplate(
  templateName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sampleVariables: Record<string, any>
): Promise<RenderedEmail> {
  return renderTemplate(templateName, sampleVariables)
}

/**
 * Register custom Handlebars helpers
 */
export function registerTemplateHelpers(): void {
  // Date formatting
  Handlebars.registerHelper('formatDate', (date: Date) => {
    return new Date(date).toLocaleDateString()
  })

  // Uppercase
  Handlebars.registerHelper('uppercase', (str: string) => {
    return str.toUpperCase()
  })

  // Lowercase
  Handlebars.registerHelper('lowercase', (str: string) => {
    return str.toLowerCase()
  })

  // Truncate
  Handlebars.registerHelper('truncate', (str: string, length: number) => {
    if (str.length <= length) return str
    return str.substring(0, length) + '...'
  })

  logger.debug('Handlebars helpers registered')
}

// Register helpers on module load
registerTemplateHelpers()
