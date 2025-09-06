import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/')
    
    // Check that page loads
    await expect(page).toHaveTitle(/Booksan/)
    
    // Basic accessibility check
    await expect(page.locator('body')).toBeVisible()
  })

  test('should navigate to auth pages', async ({ page }) => {
    await page.goto('/')
    
    // Test navigation to login (if login link exists)
    const loginLink = page.locator('a[href*="login"]').first()
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/.*login.*/)
    }
  })
})

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE
    await page.goto('/')
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('should work on tablets', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/')
    
    await expect(page.locator('body')).toBeVisible()
  })
})
