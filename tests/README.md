# Testing Guide

This project uses a comprehensive testing setup with multiple testing frameworks for different purposes.

## Testing Frameworks

### 1. **Vitest** (Unit Testing - Recommended)
Fast, modern unit testing framework with excellent TypeScript support.

**Run tests:**
```bash
npm run test              # Run tests once
npm run test:watch        # Run tests in watch mode
npm run test:ui           # Run tests with UI
npm run test:coverage     # Run tests with coverage
```

**Test files location:**
- Unit tests: `tests/unit/**/*.test.tsx` or `**/*.test.tsx`
- Configuration: `vitest.config.ts`

### 2. **Jest** (Unit Testing - Alternative)
Traditional unit testing framework, fully configured for Next.js.

**Run tests:**
```bash
npm run test:jest              # Run tests once
npm run test:jest:watch         # Run tests in watch mode
npm run test:jest:coverage      # Run tests with coverage
```

**Test files location:**
- Unit tests: `**/__tests__/**/*.test.tsx` or `**/*.test.tsx`
- Configuration: `jest.config.js`

### 3. **Playwright** (E2E & Integration Testing)
Modern, reliable end-to-end testing framework.

**Run tests:**
```bash
npm run test:e2e              # Run E2E tests
npm run test:e2e:ui           # Run with UI mode
npm run test:e2e:debug        # Run in debug mode
npm run test:e2e:headed       # Run with browser visible
```

**Test files location:**
- E2E tests: `tests/e2e/**/*.spec.ts`
- Configuration: `playwright.config.ts`

### 4. **Cypress** (E2E & Component Testing)
Popular end-to-end and component testing framework.

**Run tests:**
```bash
npm run test:cypress                    # Run E2E tests headless
npm run test:cypress:open               # Open Cypress UI
npm run test:cypress:component          # Run component tests
npm run test:cypress:component:open     # Open component test UI
```

**Test files location:**
- E2E tests: `cypress/e2e/**/*.cy.ts`
- Component tests: `cypress/component/**/*.cy.tsx`
- Configuration: `cypress.config.ts`

## Test Utilities

### Test Utils (`tests/utils/test-utils.tsx`)
Custom render function with all necessary providers (Theme, etc.)

**Usage:**
```tsx
import { render, screen } from '@/tests/utils/test-utils';
import MyComponent from '@/components/MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## Writing Tests

### Unit Tests (Vitest/Jest)
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)
```ts
import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

### E2E Tests (Cypress)
```ts
describe('Homepage', () => {
  it('loads successfully', () => {
    cy.visit('/');
    cy.contains('Welcome').should('be.visible');
  });
});
```

### Component Tests (Cypress)
```tsx
import MyComponent from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    cy.mount(<MyComponent />);
    cy.contains('Hello').should('be.visible');
  });
});
```

## Best Practices

1. **Unit Tests**: Use Vitest for fast, isolated component/function testing
2. **Integration Tests**: Use Playwright for testing user flows
3. **E2E Tests**: Use both Playwright and Cypress based on your preference
4. **Component Tests**: Use Cypress for isolated component testing with real browser

## Coverage

Coverage reports are generated in the `/coverage` directory. View HTML reports:
- Vitest: `coverage/index.html`
- Jest: `coverage/lcov-report/index.html`

## CI/CD Integration

All testing frameworks are configured to work in CI environments. Set `CI=true` environment variable for optimal CI behavior.
