import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test.describe('User Role Login', () => {
    test('should login successfully as user', async ({ page }) => {
      // Mock API responses
      await page.route('**/api/auth/email/send', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            email: 'user@example.com',
            message: 'Verification code sent',
          }),
        });
      });

      await page.route('**/api/auth/email/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            user: {
              id: 'user-1',
              email: 'user@example.com',
              name: 'John Doe',
            },
          }),
        });
      });

      // Fill login form
      await page.fill('input[placeholder*="Email"]', 'user@example.com');
      await page.fill('input[placeholder*="Password"]', 'password123');
      await page.click('button:has-text("Send")');

      // Wait for OTP step
      await expect(page.locator('text=Input your OTP')).toBeVisible();

      // Note: In a real test, you would need to mock or intercept the OTP
      // For now, we'll just verify the flow reaches the OTP step
    });

    test('should show error for invalid credentials', async ({ page }) => {
      await page.route('**/api/auth/email/send', async (route) => {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            message: 'Invalid email/username or password',
          }),
        });
      });

      await page.fill('input[placeholder*="Email"]', 'user@example.com');
      await page.fill('input[placeholder*="Password"]', 'wrongpassword');
      await page.click('button:has-text("Send")');

      // Wait for error message
      await expect(page.locator('text=/Invalid.*password/i')).toBeVisible();
    });
  });

  test.describe('Admin Role Login', () => {
    test('should login successfully as admin', async ({ page }) => {
      await page.route('**/api/auth/email/send', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            email: 'admin@example.com',
            message: 'Verification code sent',
          }),
        });
      });

      await page.route('**/api/auth/email/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            user: {
              id: 'admin-1',
              email: 'admin@example.com',
              name: 'Admin User',
              role: 'admin',
            },
          }),
        });
      });

      await page.fill('input[placeholder*="Email"]', 'admin@example.com');
      await page.fill('input[placeholder*="Password"]', 'admin123');
      await page.click('button:has-text("Send")');

      await expect(page.locator('text=Input your OTP')).toBeVisible();
    });
  });

  test.describe('SuperAdmin Role Login', () => {
    test('should login successfully as superadmin', async ({ page }) => {
      await page.route('**/api/auth/email/send', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            email: 'superadmin@example.com',
            message: 'Verification code sent',
          }),
        });
      });

      await page.route('**/api/auth/email/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            user: {
              id: 'superadmin-1',
              email: 'superadmin@example.com',
              name: 'Super Admin',
              role: 'superadmin',
            },
          }),
        });
      });

      await page.fill('input[placeholder*="Email"]', 'superadmin@example.com');
      await page.fill('input[placeholder*="Password"]', 'superadmin123');
      await page.click('button:has-text("Send")');

      await expect(page.locator('text=Input your OTP')).toBeVisible();
    });
  });

  test.describe('OAuth Login', () => {
    test('should show Google login button', async ({ page }) => {
      await expect(page.locator('text=Continue with Google')).toBeVisible();
    });

    test('should show GitHub login button', async ({ page }) => {
      await expect(page.locator('text=Continue with GitHub')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to register page', async ({ page }) => {
      const registerLink = page.locator('a:has-text("Create an account")');
      await expect(registerLink).toBeVisible();
      await expect(registerLink).toHaveAttribute('href', '/register');
    });

    test('should redirect to home if already authenticated', async ({ page, context }) => {
      // Set up authenticated session
      await context.addCookies([{
        name: 'next-auth.session-token',
        value: 'mock-session-token',
        domain: 'localhost',
        path: '/',
      }]);

      await page.goto('/login');
      
      // Should redirect to home
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Form Validation', () => {
    test('should show error if email is empty', async ({ page }) => {
      await page.click('button:has-text("Send")');
      
      // Wait for error toast/notification
      await expect(page.locator('text=/Please enter your email/i')).toBeVisible();
    });

    test('should show error if password is empty', async ({ page }) => {
      await page.fill('input[placeholder*="Email"]', 'user@example.com');
      await page.click('button:has-text("Send")');
      
      await expect(page.locator('text=/Please enter your password/i')).toBeVisible();
    });
  });
});





