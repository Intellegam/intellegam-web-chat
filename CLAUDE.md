# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Foundation

This project is based on the Vercel Chat SDK. To maintain compatibility and enable syncing with upstream changes, all code modifications should be designed to minimize conflicts with the original codebase. When implementing changes:

- Prefer extending existing functionality over replacing it
- Use composition and configuration patterns where possible
- Keep customizations isolated in separate modules when feasible
- Document deviations from the upstream codebase clearly
- Consider the impact on future upstream merges when making architectural decisions

## Essential Commands

### Development
- `pnpm dev` - Start development server with Turbo
- `pnpm build` - Run database migrations and build the application
- `pnpm start` - Start production server

### Database Operations
- `pnpm db:migrate` - Run database migrations
- `pnpm db:generate` - Generate Drizzle schema
- `pnpm db:studio` - Open Drizzle Studio for database management
- `pnpm db:push` - Push schema changes to database

### Code Quality
- `pnpm lint` - Run Next.js linting and Biome linting with auto-fix
- `pnpm lint:fix` - Run linting with fixes
- `pnpm format` - Format code with Biome

### Testing
- `pnpm test` - Run Playwright tests (sets PLAYWRIGHT=True environment variable)

## Architecture Overview

### Authentication System
The application uses WorkOS AuthKit for authentication instead of traditional Next.js Auth. The auth system is currently in transition:
- Current: WorkOS AuthKit integration (`@workos-inc/authkit-nextjs`)
- Legacy: Commented out Next-Auth configuration in `app/(auth)/auth.ts`
- User types: Regular users and guest users (guest functionality currently disabled)

### Database Schema
Uses Drizzle ORM with PostgreSQL. Key tables:
- `User` - User accounts with email/password
- `Chat` - Chat sessions with visibility settings (public/private)
- `Message_v2` - New message format with parts and attachments
- `Document` - Artifacts (text, code, image, sheet types)
- `Suggestion` - Document edit suggestions
- `Vote_v2` - Message voting system

**Important**: The schema contains deprecated tables (`Message`, `Vote`) that are being phased out. Use the `_v2` versions for new development.

### AI Integration
- Uses AI SDK with xAI Grok-2 as default model
- Configurable model providers (OpenAI, Anthropic, etc.)
- Chat models defined in `lib/ai/models.ts`
- AI tools for document creation, weather, and suggestions

### Application Structure
- **App Router**: Next.js 15 with React Server Components
- **Route Groups**: 
  - `(auth)` - Authentication pages and API routes
  - `(chat)` - Main chat interface and related APIs
- **Artifacts System**: Interactive documents (code, sheets, images, text) in `/artifacts`
- **Configuration**: Centralized chat and endpoint configuration via contexts

### Key Features
- Real-time chat with AI models
- Document artifacts with inline editing
- File upload support via Vercel Blob
- Message voting and suggestions
- Theme support (light/dark)
- Responsive design with mobile support

### Environment Setup
Requires environment variables defined in `.env.example`. Use Vercel CLI for environment management:
```bash
vercel link
vercel env pull
```

### Migration Notes
- Messages are migrating from core content to parts-based structure
- See `/docs/04-migrate-to-parts.md` for migration details
- Legacy message handling exists but should not be used for new features