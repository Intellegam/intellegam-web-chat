# Chat SDK Code Standards

Our code follows principles from **Clean Code**, **SOLID**, and modern React best practices. We write production-grade TypeScript/React code that is maintainable, scalable, and optimized for real-time AI interactions.

## Core Principles

- **Simplicity over cleverness** - The simplest solution that works is usually the best
- **Type safety over assumptions** - Leverage TypeScript to prevent runtime errors
- **Composition over complexity** - Build features from small, reusable components
- **Performance where it matters** - Optimize streaming and real-time features
- **Plan before coding** - Consider React Server/Client boundaries upfront

## Before Coding

### Design Approach

- Determine if your component should be Server or Client
- Consider data fetching patterns (server-side, SWR, or streaming)
- Plan error boundaries and loading states
- Think through real-time update requirements
- Map out type definitions before implementation

### Architecture Decisions

Ask yourself:
- Does this need to be a Client Component? (interactivity, browser APIs, hooks)
- Can this be a Server Component? (data fetching, async operations)
- Should this use streaming? (AI responses, real-time data)
- What's the error recovery strategy?

## TypeScript Standards

### Type Definitions

- Use descriptive type names that indicate purpose
- Prefer type aliases for unions and intersections
- Both interfaces and types are acceptable - choose based on use case
- Avoid `any` - use `unknown` and narrow the type
- Leverage const assertions for literal types

Reference: See `lib/types/` for existing type patterns.

### Type Safety Patterns

- Discriminated unions for state management
- Type predicates for type narrowing
- Strict null checks throughout
- Exhaustive pattern matching with `never`

## React/Next.js Patterns

### Component Guidelines

- Name components clearly indicating their purpose
- Separate Server and Client components into logical folders
- Use composition to extend functionality
- Keep components focused on a single responsibility

Reference: See `components/` directory structure for organization patterns.

### State Management

- Local state for component-specific UI state
- SWR for server state and caching
- Context for cross-component state (sparingly)
- URL state for shareable application state

### Performance Considerations

- Optimize re-renders with React.memo where measured necessary
- Use Suspense boundaries for loading states
- Implement streaming for AI responses
- Lazy load heavy components

## Error Handling

### Strategy

We use a layered approach to error handling:

1. **Type safety first** - Prevent errors through proper typing
2. **Validation at boundaries** - Validate all external inputs
3. **Graceful degradation** - Provide fallbacks for non-critical failures
4. **User-friendly messages** - Translate technical errors for users

### Implementation Patterns

- Use Error Boundaries for React component trees
- Implement try-catch in async operations
- Provide recovery mechanisms where possible
- Log errors appropriately for debugging

Reference: See existing error boundary implementations in `components/`.

## File Organization

Follow the existing structure in the repository:
- `app/` - Next.js app router pages and layouts
- `components/` - Reusable React components
- `lib/` - Core utilities and business logic
- `hooks/` - Custom React hooks
- `types/` - Shared TypeScript definitions

## Naming Conventions

- **Components**: PascalCase
- **Utilities**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase
- **Hooks**: camelCase with 'use' prefix

## Quality Assurance

Before committing:
1. Run `pnpm biome:check` for formatting and linting
2. Run `pnpm typecheck` for TypeScript validation
3. Run `pnpm test:e2e` for critical path testing
4. Ensure `pnpm build` succeeds

## Security

- Never expose API keys in client code
- Validate all user inputs
- Sanitize content before rendering
- Use environment variables properly
- Implement rate limiting on API routes

## Fork-Specific Standards

### Minimize Upstream Conflicts

- Prefer adding new files over modifying existing ones
- Use composition to extend upstream components
- Create parallel implementations when necessary

Reference: See `components/custom/` for extension patterns.

### Mark Custom Modifications

When modifying upstream files is unavoidable:
- Add clear comments marking the modification
- Include purpose, author, and date
- Consider using feature flags for easy toggling

### Feature Flags

For significant divergences, implement feature flags:
- Use environment variables for build-time flags
- Use configuration for runtime flags
- Document how to disable custom features

See the [Fork Maintenance Guide](./fork-maintenance.md) for detailed practices on managing upstream changes.

## Best Practices Summary

- Keep functions and components small and focused
- Optimize for readability and maintainability
- Test critical paths and edge cases
- Document the "why" in code comments, not the "what"
