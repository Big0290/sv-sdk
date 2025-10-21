/**
 * Email cost tracking
 * Track and estimate email sending costs per provider
 */

import { db, emailSends } from '@sv-sdk/db-config'
import { and, gte, lte } from '@sv-sdk/db-config'
import { logger } from '@sv-sdk/shared'

/**
 * Provider pricing (per 1000 emails)
 */
const PROVIDER_PRICING = {
  brevo: {
    free: { limit: 300, costPer1000: 0 },
    lite: { limit: 20000, costPer1000: 25 },
    premium: { limit: Infinity, costPer1000: 59 },
  },
  ses: {
    costPer1000: 0.1, // $0.10 per 1000 emails
  },
  mock: {
    costPer1000: 0,
  },
} as const

/**
 * Calculate email costs for a period
 */
export async function calculateEmailCosts(
  startDate: Date,
  endDate: Date
): Promise<{
  total: number
  byProvider: Record<string, { count: number; cost: number }>
}> {
  try {
    const sends = await db
      .select()
      .from(emailSends)
      .where(and(gte(emailSends.createdAt, startDate), lte(emailSends.createdAt, endDate)))

    const byProvider: Record<string, { count: number; cost: number }> = {}

    for (const send of sends) {
      const provider = send.provider || 'unknown'

      if (!byProvider[provider]) {
        byProvider[provider] = { count: 0, cost: 0 }
      }

      byProvider[provider].count++
    }

    // Calculate costs
    let total = 0

    for (const [provider, stats] of Object.entries(byProvider)) {
      let cost = 0

      if (provider === 'brevo') {
        // Simplified - would need tier detection
        cost = (stats.count / 1000) * PROVIDER_PRICING.brevo.premium.costPer1000
      } else if (provider === 'ses') {
        cost = (stats.count / 1000) * PROVIDER_PRICING.ses.costPer1000
      }

      if (byProvider[provider]) {
        byProvider[provider].cost = cost
      }
      total += cost
    }

    return {
      total,
      byProvider,
    }
  } catch (error) {
    logger.error('Failed to calculate email costs', error as Error)
    throw error
  }
}

/**
 * Get current month cost estimate
 */
export async function getCurrentMonthCost(): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const result = await calculateEmailCosts(startOfMonth, endOfMonth)

  return result.total
}

/**
 * Estimate cost for planned send
 */
export function estimateSendCost(count: number, provider: string): number {
  if (provider === 'ses') {
    return (count / 1000) * PROVIDER_PRICING.ses.costPer1000
  } else if (provider === 'brevo') {
    return (count / 1000) * PROVIDER_PRICING.brevo.premium.costPer1000
  }

  return 0
}
