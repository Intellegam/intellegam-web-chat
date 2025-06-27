# Chat SDK

> A production-ready AI chat application built with Next.js, TypeScript, and the Vercel AI SDK. Features streaming responses, custom artifacts, and multi-provider support.

## 🚀 Quick Start

Get up and running in 5 minutes:

```bash
# Clone and install
git clone https://github.com/yourusername/chat-sdk.git
cd chat-sdk
pnpm install

# Set up environment
cp .env.example .env.local
# Add your AI provider API keys

# Run development server
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to start chatting!

## 📚 Documentation Map

### Getting Started
- **[Prerequisites & Setup](./docs/getting-started/prerequisites.md)** - System requirements and initial setup
- **[Quick Start Guide](./docs/getting-started/quick-start.md)** - Build your first chat in minutes
- **[Environment Configuration](./docs/getting-started/environment-variables.md)** - Configure API keys and services

### Architecture & Design
- **[System Overview](./docs/architecture/overview.md)** - High-level architecture and design decisions
- **[Project Structure](./docs/architecture/project-structure.md)** - Directory layout and organization
- **[Data Flow](./docs/architecture/data-flow.md)** - How data moves through the system
- **[Security Model](./docs/architecture/security.md)** - Authentication and authorization

### Core Features
- **[AI Providers](./docs/features/ai-providers/overview.md)** - Multi-model support and configuration
  - [Adding New Providers](./docs/features/ai-providers/adding-providers.md)
  - [Provider Configuration](./docs/features/ai-providers/provider-config.md)
- **[Artifacts System](./docs/features/artifacts/overview.md)** - Dynamic content generation
  - [Creating Custom Artifacts](./docs/features/artifacts/creating-artifacts.md)
  - [Streaming Implementation](./docs/features/artifacts/streaming.md)
- **[Message Annotations](./docs/features/annotations/overview.md)** - Extending message metadata
  - [Custom Annotations](./docs/features/annotations/custom-annotations.md)

### Development

#### Core Guidelines
- **[📖 Documentation Guidelines](./docs/development/documentation-guidelines.md)** - How we write and maintain docs
- **[💻 Code Standards](./docs/development/code-standards.md)** - TypeScript, React, and Next.js best practices
- **[🧪 Testing Guidelines](./docs/development/testing-guidelines.md)** - E2E testing with Playwright

#### Development Guides
- **[Local Development](./docs/development/local-development.md)** - Development environment setup
- **[Component Patterns](./docs/development/component-patterns.md)** - React Server/Client components
- **[State Management](./docs/development/state-management.md)** - Managing application state
- **[Performance Optimization](./docs/development/performance.md)** - Streaming and optimization

### Testing
- **[Testing Overview](./docs/testing/overview.md)** - Testing philosophy and setup
- **[E2E Testing](./docs/testing/e2e-testing.md)** - Writing Playwright tests
- **[Mock Models](./docs/testing/mock-models.md)** - Creating deterministic AI mocks
- **[CI Integration](./docs/testing/ci-integration.md)** - Automated testing pipeline

### Deployment
- **[Vercel Deployment](./docs/deployment/vercel-deployment.md)** - One-click deploy to Vercel
- **[Self-Hosting Guide](./docs/deployment/self-hosting.md)** - Deploy to your infrastructure
- **[Production Checklist](./docs/deployment/production-checklist.md)** - Pre-launch verification

### API Reference
- **[Chat API](./docs/api/chat-api.md)** - Core chat endpoints
- **[Artifacts API](./docs/api/artifacts-api.md)** - Artifact creation and management
- **[Hooks Reference](./docs/api/hooks-reference.md)** - React hooks documentation

## 🏗️ Technology Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.6+
- **UI**: [React 19 RC](https://react.dev/) with Server Components
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/)
- **ORM**: [Drizzle](https://orm.drizzle.team/)
- **Authentication**: [WorkOS](https://workos.com/)
- **Testing**: [Playwright](https://playwright.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 🌟 Key Features

- **🤖 Multi-Provider AI Support** - Switch between OpenAI, Anthropic, xAI, and more
- **⚡ Real-time Streaming** - Smooth, progressive AI responses
- **📄 Dynamic Artifacts** - Create and edit code, documents, and visualizations
- **🎨 Customizable UI** - Theming and component customization
- **🔐 Enterprise Auth** - WorkOS integration for SSO and MFA
- **📊 Message Annotations** - Rich metadata and custom UI components
- **🧪 Comprehensive Testing** - E2E tests with AI mocking
- **📱 Responsive Design** - Works seamlessly on all devices

## 🤝 Contributing

1. Read our [Code Standards](./docs/development/code-standards.md)
2. Follow the [Testing Guidelines](./docs/development/testing-guidelines.md)
3. Update documentation per [Documentation Guidelines](./docs/development/documentation-guidelines.md)
4. Submit a PR with a clear description

### Development Workflow

```bash
# Create a feature branch
git checkout -b feature/your-feature

# Make changes and test
pnpm test:e2e
pnpm typecheck
pnpm build
