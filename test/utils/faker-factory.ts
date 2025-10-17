/**
 * Mock data factories using realistic fake data
 * Note: Install @faker-js/faker for production use
 */

import { nanoid } from 'nanoid'

/**
 * Generate random email
 */
export function fakeEmail(): string {
  const username = nanoid(8).toLowerCase()
  const domains = ['example.com', 'test.com', 'demo.com']
  const domain = domains[Math.floor(Math.random() * domains.length)]
  return `${username}@${domain}`
}

/**
 * Generate random name
 */
export function fakeName(): string {
  const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank']
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

  return `${firstName} ${lastName}`
}

/**
 * Generate test user data
 */
export function fakeUser(overrides: any = {}) {
  return {
    id: nanoid(),
    email: fakeEmail(),
    name: fakeName(),
    role: 'user',
    isActive: true,
    emailVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Generate test audit log
 */
export function fakeAuditLog(overrides: any = {}) {
  return {
    id: nanoid(),
    eventType: 'user.action',
    userId: nanoid(),
    ipAddress: '127.0.0.1',
    metadata: {},
    piiMasked: false,
    createdAt: new Date(),
    ...overrides,
  }
}

/**
 * Generate test role
 */
export function fakeRole(overrides: any = {}) {
  return {
    id: nanoid(),
    name: 'test_role',
    description: 'Test role',
    permissions: ['read:any:user'],
    isSystem: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Generate test email send
 */
export function fakeEmailSend(overrides: any = {}) {
  return {
    id: nanoid(),
    templateName: 'test_template',
    recipient: fakeEmail(),
    subject: 'Test Email',
    status: 'sent',
    provider: 'mock',
    messageId: nanoid(),
    sentAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

