import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the page to load
    await expect(page).toHaveTitle(/.*/);
    
    // Check if main content is visible
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();
  });

  test('should display hero section with correct text', async ({ page }) => {
    await page.goto('/');
    
    // Check for hero text
    await expect(page.getByText(/Learn at your pace/i)).toBeVisible();
    await expect(page.getByText(/master new skills/i)).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    await page.goto('/');
    
    // Find and click the "Start learning free" button
    const startLearningButton = page.getByRole('link', { name: /Start learning free/i });
    await expect(startLearningButton).toBeVisible();
    
    // Click and verify navigation
    await startLearningButton.click();
    await expect(page).toHaveURL(/.*courses.*/);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Verify content is still visible on mobile
    await expect(page.getByText(/Learn at your pace/i)).toBeVisible();
  });
});
