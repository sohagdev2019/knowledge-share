# Testing Setup Guide

## 🚀 Quick Start

### Installation

Install all testing dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Running Tests

#### Unit Tests (Vitest - Recommended)
```bash
npm run test              # Run once
npm run test:watch        # Watch mode
npm run test:ui           # UI mode
npm run test:coverage     # With coverage
```

#### Unit Tests (Jest - Alternative)
```bash
npm run test:jest              # Run once
npm run test:jest:watch        # Watch mode
npm run test:jest:coverage     # With coverage
```

#### E2E Tests (Playwright)
```bash
npm run test:e2e              # Run headless
npm run test:e2e:ui           # UI mode
npm run test:e2e:debug        # Debug mode
npm run test:e2e:headed       # Visible browser
```

#### E2E Tests (Cypress)
```bash
npm run test:cypress                    # Run headless
npm run test:cypress:open               # Open UI
npm run test:cypress:component          # Component tests
npm run test:cypress:component:open     # Component UI
```

## 📁 Project Structure

```
knowledge-share/
├── tests/
│   ├── setup/
│   │   ├── vitest.setup.ts      # Vitest configuration
│   │   └── jest.setup.ts         # Jest configuration
│   ├── unit/                     # Unit tests (Vitest/Jest)
│   │   └── components/
│   ├── e2e/                      # E2E tests (Playwright)
│   │   └── homepage.spec.ts
│   ├── utils/
│   │   └── test-utils.tsx        # Test utilities
│   ├── helpers/
│   │   └── render-helpers.tsx    # Render helpers
│   ├── fixtures/
│   │   └── index.ts              # Mock data
│   └── __mocks__/
│       ├── next-auth.ts          # NextAuth mocks
│       └── prisma.ts              # Prisma mocks
├── cypress/
│   ├── e2e/                      # Cypress E2E tests
│   │   └── homepage.cy.ts
│   ├── component/                # Cypress component tests
│   │   └── Hero.cy.tsx
│   └── support/
│       ├── e2e.ts                # E2E support
│       ├── component.tsx         # Component support
│       └── commands.ts           # Custom commands
├── vitest.config.ts              # Vitest config
├── jest.config.js                # Jest config
├── playwright.config.ts          # Playwright config
└── cypress.config.ts             # Cypress config
```

## 🧪 Testing Frameworks Overview

### 1. Vitest (Unit Testing) ⚡
- **Purpose**: Fast unit and integration tests
- **Best for**: Component testing, utility functions, hooks
- **Speed**: Very fast (uses Vite)
- **TypeScript**: Excellent support

### 2. Jest (Unit Testing) 🔧
- **Purpose**: Traditional unit testing
- **Best for**: Legacy codebases, teams familiar with Jest
- **Speed**: Fast
- **TypeScript**: Good support

### 3. Playwright (E2E Testing) 🎭
- **Purpose**: End-to-end and integration testing
- **Best for**: Full user flows, cross-browser testing
- **Speed**: Moderate (real browser)
- **Features**: Auto-waiting, network interception, mobile emulation

### 4. Cypress (E2E & Component Testing) 🌲
- **Purpose**: E2E and component testing
- **Best for**: Component testing in real browser, E2E with great DX
- **Speed**: Moderate (real browser)
- **Features**: Time travel, component testing, great debugging

## 📝 Writing Tests

### Example: Unit Test (Vitest)
```tsx
// tests/unit/components/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/tests/utils/test-utils';
import Button from '@/components/ui/button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Example: E2E Test (Playwright)
```ts
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

### Example: E2E Test (Cypress)
```ts
// cypress/e2e/login.cy.ts
describe('Login', () => {
  it('allows user to login', () => {
    cy.visit('/login');
    cy.get('input[name="email"]').type('test@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});
```

### Example: Component Test (Cypress)
```tsx
// cypress/component/Button.cy.tsx
import Button from '@/components/ui/button';

describe('Button Component', () => {
  it('renders and handles click', () => {
    cy.mount(<Button onClick={() => cy.log('clicked')}>Click me</Button>);
    cy.contains('Click me').should('be.visible');
    cy.contains('Click me').click();
  });
});
```

## 🛠️ Configuration Files

### Vitest (`vitest.config.ts`)
- Configured with React plugin
- Path aliases (`@/*`) supported
- Coverage with v8 provider
- Excludes E2E test directories

### Jest (`jest.config.js`)
- Next.js integration
- Path aliases configured
- Coverage reporting
- Excludes E2E test directories

### Playwright (`playwright.config.ts`)
- Multiple browser support (Chrome, Firefox, Safari)
- Mobile viewports
- Auto-starts dev server
- HTML reports

### Cypress (`cypress.config.ts`)
- Separate E2E and component configs
- Next.js webpack integration
- Custom commands support

## 🎯 Best Practices

1. **Use Vitest for unit tests** - It's faster and has better Next.js integration
2. **Use Playwright for E2E** - More reliable and feature-rich
3. **Use Cypress for component tests** - Great DX for component testing
4. **Keep tests isolated** - Each test should be independent
5. **Use test utilities** - Leverage `test-utils.tsx` for consistent rendering
6. **Mock external dependencies** - Use mocks for API calls, auth, etc.
7. **Write descriptive test names** - Clear test descriptions help debugging

## 📊 Coverage

Generate coverage reports:
```bash
npm run test:coverage        # Vitest
npm run test:jest:coverage   # Jest
```

View HTML reports:
- Vitest: `coverage/index.html`
- Jest: `coverage/lcov-report/index.html`

## 🔧 Troubleshooting

### Vitest: Module not found
- Ensure path aliases are configured in `vitest.config.ts`
- Check `tsconfig.json` paths match

### Playwright: Tests timing out
- Increase timeout in `playwright.config.ts`
- Ensure dev server is running on port 3000

### Cypress: Component tests not working
- Ensure `cypress/support/component.tsx` is properly configured
- Check Next.js webpack config in `cypress.config.ts`

## 📚 Resources

- [Vitest Docs](https://vitest.dev/)
- [Jest Docs](https://jestjs.io/)
- [Playwright Docs](https://playwright.dev/)
- [Cypress Docs](https://docs.cypress.io/)
- [React Testing Library](https://testing-library.com/react)
