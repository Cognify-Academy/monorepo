# Testing Infrastructure

This document outlines the comprehensive testing setup for Cognify Academy.

## Overview

We use a multi-layered testing approach with different tools for different types of tests:

- **Unit Tests**: Vitest + Testing Library (React components)
- **Integration Tests**: Vitest + Testing Library (component interactions)
- **E2E Tests**: Playwright (full user workflows)
- **Visual Tests**: Storybook Test Runner (component stories)
- **API Tests**: Bun Test (existing setup)

## Test Structure

```
├── packages/test-utils/          # Shared test utilities
├── apps/cognify-ui/
│   ├── src/__tests__/
│   │   ├── unit/                 # Unit tests
│   │   └── integration/          # Integration tests
│   └── vitest.config.ts         # Vitest configuration
├── e2e/                         # E2E tests
│   ├── auth/
│   ├── courses/
│   └── fixtures.ts
├── .storybook/                  # Storybook configuration
└── playwright.config.ts         # Playwright configuration
```

## Running Tests

### All Tests

```bash
# Run all tests (CI mode - runs once and exits)
bun run test

# Run all tests in watch mode (development mode)
bun run test:watch

# Run all tests including E2E and Storybook
bun run test:all
```

### Unit & Integration Tests

```bash
# Run all frontend tests (CI mode - runs once and exits)
bun run test:ui

# Run in watch mode (development mode - watches for changes)
bun run test:ui:watch

# Run with UI
bun run test:ui:ui

# Run with coverage
bun run test:ui:coverage
```

### E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run with UI
bun run test:e2e:ui

# Run in headed mode
bun run test:e2e:headed
```

### Storybook Tests

```bash
# Run Storybook tests
bun run test:storybook

# Start Storybook development server
bun run storybook

# Build Storybook for production
bun run storybook:build
```

### API Tests

```bash
# Run API tests
bun run test:api
```

## Test Types

### Unit Tests

Test individual components in isolation:

```typescript
// Example: button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/button';

test('renders with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### Integration Tests

Test component interactions and context:

```typescript
// Example: auth-context.test.tsx
import { render, screen } from '@testing-library/react';
import { AuthProvider } from '@/contexts/auth';

test('provides authentication state', () => {
  render(
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
  // Test interactions...
});
```

### E2E Tests

Test complete user workflows:

```typescript
// Example: login.spec.ts
import { test, expect } from "../fixtures";

test("user can login", async ({ loginPage }) => {
  await loginPage.goto();
  await loginPage.login("test@example.com", "password123");
  await expect(page).toHaveURL("/");
});
```

## Test Utilities

The `@test-utils` package provides shared utilities:

- **Mock Data Factories**: `createMockUser()`, `createMockCourse()`, etc.
- **Test Helpers**: `waitForNextTick()`, `createMockRequest()`, etc.
- **Component Test Helpers**: `createWrapper()`, custom matchers
- **API Test Helpers**: `mockApiResponse()`, `mockApiError()`

## Coverage Requirements

- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

## Best Practices

### Unit Tests

- Test one thing at a time
- Use descriptive test names
- Mock external dependencies
- Test both happy path and edge cases

### Integration Tests

- Test component interactions
- Use real context providers
- Test error states
- Verify side effects

### E2E Tests

- Test critical user journeys
- Use page object models
- Keep tests independent
- Use data-testid attributes

### Writing Tests

1. **Arrange**: Set up test data and mocks
2. **Act**: Perform the action being tested
3. **Assert**: Verify the expected outcome

### Test Data

- Use factory functions for consistent test data
- Keep test data minimal and focused
- Use realistic but not production data

## Debugging Tests

### Vitest

```bash
# Run specific test file (CI mode)
bun run test:ui button.test.tsx

# Run with debug output
bun run test:ui --reporter=verbose

# Run in watch mode (development)
bun run test:ui:watch

# Run with UI
bun run test:ui:ui
```

### Playwright

```bash
# Run specific test
bun run test:e2e login.spec.ts

# Run with debug mode
bun run test:e2e --debug

# Run with headed browser
bun run test:e2e:headed
```

## CI/CD Integration

Tests run automatically on:

- Pull requests
- Main branch pushes
- Release tags

Coverage reports are generated and uploaded to the CI system.

## Troubleshooting

### Common Issues

1. **Tests timing out**: Increase timeout in config
2. **Flaky E2E tests**: Add proper waits and retries
3. **Mock not working**: Check import paths and mock setup
4. **Coverage not updating**: Clear coverage directory and re-run

### Getting Help

- Check test logs for specific error messages
- Use `--verbose` flag for detailed output
- Review test utilities documentation
- Check existing test examples for patterns
