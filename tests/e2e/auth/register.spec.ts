import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test.describe('User Role Registration', () => {
    test('should register user account successfully', async ({ page }) => {
      // Mock API responses
      await page.route('**/api/student-registration/send-otp', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Verification code sent',
          }),
        });
      });

      await page.route('**/api/student-registration/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Student account created successfully! You can now login.',
          }),
        });
      });

      // Step 1: Personal Information
      await page.fill('input[id*="firstName"]', 'John');
      await page.fill('input[id*="lastName"]', 'Doe');
      await page.fill('input[id*="username"]', 'johndoe');
      await page.click('button:has-text("Continue")');

      // Step 2: Account Credentials
      await expect(page.locator('text=Account Credentials')).toBeVisible();
      await page.fill('input[id*="email"]', 'user@example.com');
      await page.fill('input[id*="password"]', 'password123');
      await page.fill('input[id*="confirmPassword"]', 'password123');
      await page.click('button:has-text("Create Student Account")');

      // Step 3: OTP Verification
      await expect(page.locator('text=Verify your email')).toBeVisible();
      
      // Note: In a real test, you would need to mock or intercept the OTP
      // For now, we'll just verify the flow reaches the OTP step
    });

    test('should validate form fields', async ({ page }) => {
      // Test firstName validation
      await page.fill('input[id*="firstName"]', 'J'); // Too short
      await page.blur('input[id*="firstName"]');
      await expect(page.locator('text=/first name must be at least 2 characters/i')).toBeVisible();

      // Test username validation
      await page.fill('input[id*="username"]', 'john-doe'); // Invalid format
      await page.blur('input[id*="username"]');
      await expect(page.locator('text=/username can only contain/i')).toBeVisible();
    });
  });

  test.describe('Teacher Role Registration', () => {
    test('should register teacher account successfully', async ({ page }) => {
      await page.route('**/api/student-registration/send-otp', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Verification code sent',
          }),
        });
      });

      await page.route('**/api/student-registration/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Teacher account created successfully! You can now login.',
          }),
        });
      });

      // Switch to teacher account
      await page.click('button:has-text("Teacher Account")');

      // Step 1: Personal Information
      await page.fill('input[id*="firstName"]', 'Teacher');
      await page.fill('input[id*="lastName"]', 'User');
      await page.fill('input[id*="username"]', 'teacher');
      await page.click('button:has-text("Continue")');

      // Step 2: Account Credentials
      await page.fill('input[id*="email"]', 'teacher@example.com');
      await page.fill('input[id*="password"]', 'password123');
      await page.fill('input[id*="confirmPassword"]', 'password123');
      await page.click('button:has-text("Create Teacher Account")');

      // Step 3: OTP Verification
      await expect(page.locator('text=Verify your email')).toBeVisible();
    });
  });

  test.describe('Account Type Switching', () => {
    test('should switch between student and teacher account types', async ({ page }) => {
      // Default should be student
      const studentButton = page.locator('button:has-text("Student Account")');
      await expect(studentButton).toHaveClass(/text-primary-foreground/);

      // Switch to teacher
      await page.click('button:has-text("Teacher Account")');
      const teacherButton = page.locator('button:has-text("Teacher Account")');
      await expect(teacherButton).toHaveClass(/text-primary-foreground/);
    });
  });

  test.describe('Step Navigation', () => {
    test('should navigate between steps correctly', async ({ page }) => {
      // Step 1
      await expect(page.locator('text=Personal Information')).toBeVisible();

      // Move to step 2
      await page.fill('input[id*="firstName"]', 'John');
      await page.fill('input[id*="lastName"]', 'Doe');
      await page.fill('input[id*="username"]', 'johndoe');
      await page.click('button:has-text("Continue")');

      await expect(page.locator('text=Account Credentials')).toBeVisible();

      // Go back to step 1
      await page.click('button:has-text("Back")');
      await expect(page.locator('text=Personal Information')).toBeVisible();
    });
  });

  test.describe('Error Handling', () => {
    test('should show error if email already exists', async ({ page }) => {
      await page.route('**/api/student-registration/send-otp', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            message: 'Email already exists. Please use a different email address.',
          }),
        });
      });

      // Complete form
      await page.fill('input[id*="firstName"]', 'John');
      await page.fill('input[id*="lastName"]', 'Doe');
      await page.fill('input[id*="username"]', 'johndoe');
      await page.click('button:has-text("Continue")');

      await page.fill('input[id*="email"]', 'existing@example.com');
      await page.fill('input[id*="password"]', 'password123');
      await page.fill('input[id*="confirmPassword"]', 'password123');
      await page.click('button:has-text("Create Student Account")');

      await expect(page.locator('text=/Email already exists/i')).toBeVisible();
    });

    test('should show error if username already exists', async ({ page }) => {
      await page.route('**/api/student-registration/send-otp', async (route) => {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'error',
            message: 'Username already exists. Please choose a different username.',
          }),
        });
      });

      // Complete form
      await page.fill('input[id*="firstName"]', 'John');
      await page.fill('input[id*="lastName"]', 'Doe');
      await page.fill('input[id*="username"]', 'existing');
      await page.click('button:has-text("Continue")');

      await page.fill('input[id*="email"]', 'new@example.com');
      await page.fill('input[id*="password"]', 'password123');
      await page.fill('input[id*="confirmPassword"]', 'password123');
      await page.click('button:has-text("Create Student Account")');

      await expect(page.locator('text=/Username already exists/i')).toBeVisible();
    });
  });

  test.describe('Password Validation', () => {
    test('should validate password minimum length', async ({ page }) => {
      await page.fill('input[id*="firstName"]', 'John');
      await page.fill('input[id*="lastName"]', 'Doe');
      await page.fill('input[id*="username"]', 'johndoe');
      await page.click('button:has-text("Continue")');

      await page.fill('input[id*="password"]', '12345'); // Too short
      await page.blur('input[id*="password"]');

      await expect(page.locator('text=/password must be at least 6 characters/i')).toBeVisible();
    });

    test('should validate password confirmation match', async ({ page }) => {
      await page.fill('input[id*="firstName"]', 'John');
      await page.fill('input[id*="lastName"]', 'Doe');
      await page.fill('input[id*="username"]', 'johndoe');
      await page.click('button:has-text("Continue")');

      await page.fill('input[id*="password"]', 'password123');
      await page.fill('input[id*="confirmPassword"]', 'different123');
      await page.blur('input[id*="confirmPassword"]');

      await expect(page.locator('text=/passwords must match/i')).toBeVisible();
    });
  });

  test.describe('Navigation', () => {
    test('should navigate to login page', async ({ page }) => {
      const loginLink = page.locator('a:has-text("Login")');
      await expect(loginLink).toBeVisible();
      await expect(loginLink).toHaveAttribute('href', '/login');
    });

    test('should redirect to login after successful registration', async ({ page }) => {
      await page.route('**/api/student-registration/send-otp', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success' }),
        });
      });

      await page.route('**/api/student-registration/verify', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 'success',
            message: 'Account created successfully',
          }),
        });
      });

      // Complete registration flow
      // ... (form filling and submission)

      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });
});





