# Test Suite Documentation

This directory contains comprehensive tests for the login and registration functionality, covering both frontend and backend with support for all user roles (user, admin, superadmin).

## Test Structure

```
tests/
├── api/                    # Backend API tests
│   └── auth/
│       ├── login-send-otp.test.ts
│       ├── login-verify-otp.test.ts
│       ├── register-send-otp.test.ts
│       └── register-verify-otp.test.ts
├── unit/                   # Frontend component tests
│   └── components/
│       ├── LoginForm.test.tsx
│       └── RegistrationForm.test.tsx
├── e2e/                    # End-to-end tests
│   └── auth/
│       ├── login.spec.ts
│       └── register.spec.ts
└── ...
```

## Running Tests

### Backend API Tests (Vitest)
```bash
# Run all API tests
npm run test tests/api

# Run specific test file
npm run test tests/api/auth/login-send-otp.test.ts

# Watch mode
npm run test:watch tests/api
```

### Frontend Component Tests (Vitest)
```bash
# Run all component tests
npm run test tests/unit

# Run specific test file
npm run test tests/unit/components/LoginForm.test.tsx

# Watch mode
npm run test:watch tests/unit
```

### E2E Tests (Playwright)
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npm run test:e2e tests/e2e/auth/login.spec.ts

# Run in UI mode
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed
```

## Test Coverage

### Backend API Tests

#### Login Endpoints (`/api/auth/email/send` and `/api/auth/email/verify`)
- ✅ User role login flow
- ✅ Admin role login flow
- ✅ SuperAdmin role login flow
- ✅ Email and username login
- ✅ Password validation
- ✅ OTP generation and verification
- ✅ Error handling (invalid credentials, expired OTP, etc.)
- ✅ Resend OTP functionality

#### Registration Endpoints (`/api/student-registration/send-otp` and `/api/student-registration/verify`)
- ✅ User role registration
- ✅ Teacher role registration
- ✅ Form validation (firstName, lastName, username, email, password)
- ✅ Duplicate email/username checks
- ✅ OTP generation and verification
- ✅ Password hashing
- ✅ Error handling (validation errors, duplicate accounts, etc.)

### Frontend Component Tests

#### LoginForm Component
- ✅ Initial render and form fields
- ✅ Form validation (empty fields, invalid input)
- ✅ Login flow for all roles (user, admin, superadmin)
- ✅ OTP input and verification
- ✅ OAuth login (Google, GitHub)
- ✅ Error handling and user feedback
- ✅ Redirect behavior for authenticated users

#### RegistrationForm Component
- ✅ Initial render and form fields
- ✅ Account type switching (Student/Teacher)
- ✅ Multi-step form navigation
- ✅ Form validation for all steps
- ✅ Registration flow for user and teacher roles
- ✅ OTP verification step
- ✅ Error handling and user feedback
- ✅ Step navigation (back/forward)

### E2E Tests

#### Login Flow (`/login`)
- ✅ Complete login flow for all roles
- ✅ Form validation
- ✅ Error handling
- ✅ OAuth buttons
- ✅ Navigation links
- ✅ Redirect behavior

#### Registration Flow (`/register`)
- ✅ Complete registration flow for user role
- ✅ Complete registration flow for teacher role
- ✅ Account type switching
- ✅ Form validation
- ✅ Step navigation
- ✅ Error handling
- ✅ Password validation
- ✅ Redirect to login after successful registration

## Role-Based Testing

All tests cover three user roles:

1. **User** (`role: "user"`)
   - Standard user account
   - Can access public features
   - Limited permissions

2. **Admin** (`role: "admin"`)
   - Administrative account
   - Can manage courses and content
   - Access to admin dashboard

3. **SuperAdmin** (`role: "superadmin"`)
   - Highest level access
   - Full system administration
   - Access to superadmin features

## Mocking Strategy

### Backend Tests
- Prisma client is mocked using `vi.mock('@/lib/db')`
- Email service (Brevo) is mocked
- bcrypt is mocked for password hashing
- All external dependencies are isolated

### Frontend Tests
- Next.js router is mocked
- NextAuth is mocked
- Fetch API is mocked for API calls
- Toast notifications are mocked

### E2E Tests
- API routes are intercepted and mocked
- Real browser interactions
- Network conditions can be simulated

## Test Data

Test fixtures and mock data are defined in:
- `tests/fixtures/index.ts` - Shared test data
- `tests/__mocks__/prisma.ts` - Prisma mock helpers
- `tests/__mocks__/next-auth.ts` - NextAuth mock helpers

## Best Practices

1. **Isolation**: Each test is independent and doesn't rely on other tests
2. **Cleanup**: Mocks are cleared between tests using `beforeEach`
3. **Realistic Data**: Test data mimics real-world scenarios
4. **Error Coverage**: Both success and error paths are tested
5. **Role Coverage**: All user roles are tested for each feature

## Continuous Integration

These tests are designed to run in CI/CD pipelines:
- Fast execution (mocked dependencies)
- Deterministic results
- No external service dependencies
- Clear error messages

## Troubleshooting

### Tests failing due to missing mocks
- Ensure all dependencies are properly mocked
- Check that mock implementations match actual API responses

### E2E tests timing out
- Increase timeout in Playwright config if needed
- Check that API routes are properly intercepted

### Component tests not finding elements
- Verify that component structure matches test selectors
- Check that components are properly rendered in test environment

## Future Enhancements

- [ ] Add integration tests for complete user journeys
- [ ] Add performance tests for API endpoints
- [ ] Add accessibility tests for forms
- [ ] Add visual regression tests
- [ ] Add security tests (rate limiting, SQL injection, etc.)





