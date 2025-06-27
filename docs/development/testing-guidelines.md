# Chat SDK Testing Guidelines

## Core Philosophy

Our testing approach prioritizes **user experience validation** over implementation details. We focus on testing real user workflows through the application, ensuring that AI interactions, streaming responses, and UI updates work seamlessly together.

### Key Principles

1. **End-to-end confidence** - Test complete user journeys, not isolated units
2. **Mock at the AI boundary** - Use mock language models to ensure predictable, fast tests
3. **Real interactions over stubs** - Test actual React components and Next.js routes
4. **Deterministic over flaky** - Prefer reliable tests that run consistently
5. **Developer experience** - Tests should be easy to write, run, and debug

**Guiding principle:** _If it affects the user experience, it needs a test._

## Test Planning

Before writing any test, plan:

- **User journey** - What is the user trying to accomplish?
- **Critical paths** - What must work for the feature to be valuable?
- **Edge cases** - What happens with errors, timeouts, or unexpected input?
- **AI behavior** - What AI responses do we need to simulate?
- **Performance** - Are there streaming or real-time aspects to test?

## E2E Testing with Playwright

### Test Organization

We use the Page Object pattern to encapsulate page interactions and make tests more maintainable. Tests are organized by feature area and user journey.

Reference: See `tests/pages/` for existing page objects and `tests/e2e/` for test examples.

### AI Model Mocking

We use deterministic mock models to ensure tests are fast and reliable. Mock models simulate streaming responses and various AI behaviors without calling real APIs.

Reference: See `tests/fixtures/mock-models.ts` for mock implementation patterns.

### Test Patterns

Our tests follow these patterns:

1. **User-centric scenarios** - Test what users actually do, not technical implementation
2. **Streaming validation** - Ensure progressive content appears correctly
3. **Error recovery** - Verify graceful handling of failures
4. **Performance assertions** - Check that responses happen within acceptable timeframes

## Test Structure

Tests are organized in:
- `tests/e2e/` - End-to-end user journeys
- `tests/fixtures/` - Shared utilities and mocks
- `tests/pages/` - Page object models
- `tests/helpers/` - Test utilities

## Running Tests

Execute tests using these commands:
- `pnpm test:e2e` - Run all E2E tests
- `pnpm test:e2e:ui` - Debug with Playwright UI
- `pnpm test:e2e --grep "pattern"` - Run specific tests

## Best Practices

### DO:
- Test user-visible behavior
- Use data-testid for reliable selectors
- Mock external services (AI, APIs)
- Test both success and error paths
- Keep tests independent
- Use page objects for reusability

### DON'T:
- Test implementation details
- Use arbitrary timeouts
- Create interdependent tests
- Mock internal application logic
- Over-specify assertions
- Ignore flaky tests

## Performance Testing

Include performance assertions for critical user experiences:
- Initial page load time
- Time to first AI response
- Streaming response smoothness
- Artifact rendering performance

## Debugging

When tests fail:
1. Use `--headed` flag to see the browser
2. Add `--debug` for step-by-step debugging
3. Check traces with `--trace on-first-retry`
4. Review screenshots in test results

## CI/CD Integration

Tests run automatically on:
- Pull requests (subset of critical tests)
- Main branch commits (full suite)
- Pre-deployment (comprehensive validation)

Reference: See `.github/workflows/` for CI configuration.

## Fork-Specific Testing

### Upstream Compatibility

We maintain tests that verify core upstream functionality remains intact. These tests run against features without our customizations enabled.

### Custom Feature Testing

Tests for fork-specific features are clearly marked and organized separately. This allows us to:
- Validate our additions work correctly
- Easily identify what needs retesting after rebasing
- Disable custom features for upstream testing

### Regression Prevention

After each rebase from upstream:
1. Run upstream compatibility suite
2. Validate all custom features
3. Check for performance regressions
4. Verify no visual regressions

Reference: See `tests/e2e/upstream-compatibility.test.ts` for patterns.

## Test Maintenance

Keep tests maintainable by:
- Using descriptive test names that explain the user scenario
- Keeping page objects up to date with UI changes
- Removing obsolete tests promptly
- Documenting complex test scenarios
- Regular test suite performance reviews

Remember: **Great tests tell a story about how users interact with your application.** They should be readable, reliable, and provide confidence that the user experience works as intended.
