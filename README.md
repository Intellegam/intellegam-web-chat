# AI Chat Application

![Next.js Version](https://img.shields.io/badge/next.js-15-black.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.6-blue.svg)
![License](https://img.shields.io/badge/license-Proprietary-red.svg)

Our AI chat application frontend that connects to custom backend services. Based on a fork of Vercel's AI Chatbot with extensive modifications for our specific requirements.

## Key Features

- 🤖 **Custom Backend Integration**: Connects to our backend endpoints
- ⚡ **Real-time Streaming**: Progressive AI responses via SSE
- 📄 **Dynamic Artifacts**: Code editing, documents, and visualizations
- 🔐 **Enterprise Auth**: WorkOS integration
- 📊 **Message Annotations**: Rich metadata and custom UI components
- 🎨 **Configurable UI**: Dynamic configuration from backend
- 🧪 **E2E Testing**: Playwright tests with mock models
- 🔄 **Fork Maintenance**: Systematic upstream synchronization

## System Architecture

The application separates frontend from backend AI processing:

```mermaid
graph TB
    subgraph "Client/Browser"
        UI[Chat Interface]
    end

    subgraph "Frontend (This Repo)"
        Routes[Next.js Route Handlers]
        Auth[WorkOS Authentication]
        Stream[Streaming Handler]
        Config[Configuration Layer]
    end

    subgraph "Backend Services"
        API[Backend API]
        ConfigEndpoint[/config Endpoint]
        ChatEndpoint[/chat Endpoint]
    end

    subgraph "Data Storage"
        DB[(PostgreSQL/Neon)]
        Blob[Vercel Blob Storage]
    end

    UI -->|HTTP/SSE| Routes
    Routes --> Auth
    Routes --> Stream
    Routes --> Config

    Config -->|Fetch Config| ConfigEndpoint
    Stream -->|Stream Messages| ChatEndpoint

    Routes --> DB
    Routes --> Blob

    API --> ConfigEndpoint
    API --> ChatEndpoint
```

### Core Components

#### 💬 Chat Interface
- Real-time message streaming
- Conversation persistence
- File attachment support

#### ⚙️ Configuration System
- `EndpointConfig`: Backend connection settings
- `ChatConfig`: UI appearance and behavior
- `AdminChatConfig`: Feature toggles

#### 📝 Artifacts & Annotations
- Rich content beyond text
- Extensible content types
- Custom UI components

#### 🔒 Authentication
- WorkOS hosted auth
- Session management
- SSO support

## Project Structure

```
├── docs/                    # Documentation
│   ├── architecture/        # System design
│   ├── development/         # Development guidelines
│   │   ├── code-standards.md
│   │   ├── testing-guidelines.md
│   │   ├── documentation-guidelines.md
│   │   └── fork-maintenance.md
│   ├── features/            # Feature documentation
│   └── getting-started/     # Setup guides
│
├── app/                     # Next.js app router
│   ├── (auth)/             # Authentication
│   ├── (chat)/             # Chat application
│   └── api/                # API routes
│
├── components/              # React components
│   ├── ui/                 # Base components
│   ├── chat.tsx            # Main chat
│   └── artifact.tsx        # Artifact system
│
├── lib/                     # Core logic
│   ├── ai/                 # AI setup
│   ├── config/             # Configuration
│   ├── db/                 # Database
│   └── utils/              # Utilities
│
├── tests/                   # Test suite
│   ├── e2e/                # E2E tests
│   └── fixtures/           # Test utilities
│
└── package.json            # Dependencies
```

## Development

### Prerequisites

- Node.js 20+
- pnpm
- PostgreSQL (Neon)
- WorkOS credentials
- Backend endpoint access

### Setup

```bash
# Install dependencies
pnpm install

# Configure environment
cp .env.example .env.local
# Add your credentials to .env.local

# Run development server
pnpm dev
```

### Development Guidelines

**Before coding:**
- [Code Standards](./docs/development/code-standards.md) - Our TypeScript/React patterns
- [Testing Guidelines](./docs/development/testing-guidelines.md) - E2E testing approach
- [Documentation Guidelines](./docs/development/documentation-guidelines.md) - Documentation practices
- [Fork Maintenance](./docs/development/fork-maintenance.md) - Upstream sync process

### Common Tasks

**Development:**
```bash
pnpm dev                 # Development server
pnpm build              # Production build
pnpm test:e2e           # Run tests
pnpm test:e2e:ui        # Debug tests
```

**Code Quality:**
```bash
pnpm biome:check        # Format and lint
pnpm typecheck          # Type checking
```

**Database:**
```bash
pnpm db:migrate         # Run migrations
pnpm db:studio          # Database UI
```

### Backend Connection

**Development**: Auto-connects to `localhost:8000`
**Other Environments**: Use URL parameters:
```
?endpoint=https://api.example.com/chat
?subscriptionKey=your-key
```

## Fork Maintenance

We maintain this fork with systematic upstream synchronization:

1. **Atomic commits** for easy rebasing
2. **Categorized changes** (feat:, fix:)
3. **Minimal upstream modifications**
4. **Regular rebasing** to stay current

See [Fork Maintenance Guide](./docs/development/fork-maintenance.md) for detailed practices.

## Deployment

Deployed via Vercel with environment-specific configurations. See internal deployment documentation for details.

## Documentation

- [Quick Start](./docs/development/quick-start.md) - Get running quickly
- [Architecture Overview](./docs/architecture/overview.md) - System design
- [Backend Integration](./docs/features/backend-integration.md) - Backend connection details

---

_Internal project - see team documentation for additional resources_
