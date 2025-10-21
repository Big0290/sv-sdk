import { test, expect } from '@playwright/test';

test.describe('Admin App E2E', () => {
	test('should load login page', async ({ page }) => {
		await page.goto('http://localhost:5173/login');
		await expect(page).toHaveTitle(/SV-SDK Admin/);
		await expect(page.locator('h1')).toContainText('SV-SDK Admin');
	});

	test('should login with valid credentials', async ({ page }) => {
		await page.goto('http://localhost:5173/login');

		// Fill login form
		await page.fill('input[type="email"]', 'admin@example.com');
		await page.fill('input[type="password"]', 'Admin123!');

		// Submit
		await page.click('button[type="submit"]');

		// Should redirect to dashboard
		await expect(page).toHaveURL(/.*dashboard/);
		await expect(page.locator('h1')).toContainText('Dashboard');
	});

	test('should navigate to users page', async ({ page }) => {
		// Login first
		await page.goto('http://localhost:5173/login');
		await page.fill('input[type="email"]', 'admin@example.com');
		await page.fill('input[type="password"]', 'Admin123!');
		await page.click('button[type="submit"]');

		// Navigate to users
		await page.click('a[href="/users"]');
		await expect(page).toHaveURL(/.*users/);
		await expect(page.locator('h1')).toContainText('Users');
	});

	test('should search users', async ({ page }) => {
		// Login
		await page.goto('http://localhost:5173/login');
		await page.fill('input[type="email"]', 'admin@example.com');
		await page.fill('input[type="password"]', 'Admin123!');
		await page.click('button[type="submit"]');

		// Go to users
		await page.goto('http://localhost:5173/users');

		// Search
		await page.fill('input[type="search"]', 'admin');

		// Should filter results
		await expect(page.locator('table tbody tr')).toHaveCount(1);
	});
});
