import { test, expect } from '@playwright/test'

test.describe('Demo App E2E', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('http://localhost:5174/')
    await expect(page).toHaveTitle(/SV-SDK Demo/)
    await expect(page.locator('h1')).toContainText('Production-Ready')
  })

  test('should navigate to signup', async ({ page }) => {
    await page.goto('http://localhost:5174/')
    await page.click('a[href="/signup"]')
    await expect(page).toHaveURL(/.*signup/)
    await expect(page.locator('h1')).toContainText('Create Account')
  })

  test('should signup new user', async ({ page }) => {
    await page.goto('http://localhost:5174/signup')

    // Fill signup form
    await page.fill('input[placeholder="John Doe"]', 'Test User')
    await page.fill('input[type="email"]', `test${Date.now()}@example.com`)
    await page.fill('input[placeholder="••••••••"]:nth-of-type(1)', 'TestPassword123!')
    await page.fill('input[placeholder="••••••••"]:nth-of-type(2)', 'TestPassword123!')

    // Submit
    await page.click('button[type="submit"]')

    // Should redirect to verification page
    await expect(page).toHaveURL(/.*verify-email/)
  })

  test('should navigate to features page', async ({ page }) => {
    await page.goto('http://localhost:5174/')
    await page.click('a[href="/features"]')
    await expect(page).toHaveURL(/.*features/)
    await expect(page.locator('h1')).toContainText('Platform Features')
  })
})
