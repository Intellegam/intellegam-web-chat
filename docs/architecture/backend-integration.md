# Backend Integration Guide

## Overview

Chat SDK integrates with a custom backend for AI chat functionality. This architecture provides centralized AI processing, custom business logic, and dynamic configuration.

## Backend Connection Methods

### 1. URL Parameter Configuration

Pass backend details via URL parameters:

```
# Basic endpoint
https://your-app.com?endpoint=https://api.example.com/chat

# With authentication
https://your-app.com?endpoint=https://api.example.com/chat&subscriptionKey=sk_123

# Encrypted parameters (for production)
https://your-app.com?endpoint=https://api.example.com/chat&subscriptionKey=encrypted_value
```

Reference: See `lib/config/EncryptionHelper.ts` for parameter encryption.

### 2. Environment-Based Defaults

The system automatically selects endpoints based on environment:

- **Development**: Checks `http://127.0.0.1:8000` first
- **Preview/Development without params**: Uses Intellegam sample API
- **Production**: Requires explicit endpoint configuration

Reference: See `lib/utils/endpointUtils.ts` for endpoint determination logic.

### 3. Backend Config API

Backends can provide UI configuration via `/config` endpoint:

```
GET https://your-api.com/chat/config
Headers: 
  - Content-Type: application/json
  - Subscription-Key: your-key (if required)

Response:
{
  "interface": {
    "title": "Custom Chat",
    "startMessage": "Welcome! How can I help?",
    "startPrompts": ["Tell me about...", "Help me with..."],
    "enableFeedback": true,
    "showFileUpload": true
  }
}
```

## Configuration Classes

### EndpointConfig

Manages backend connection details:
- `endpoint` - Backend URL
- `subscriptionKey` - Optional API authentication

### ChatConfig

Controls UI appearance and behavior:
- `title` - Application title
- `startMessage` - Initial assistant message
- `startPrompts` - Suggested user prompts
- `titleLogo` - Logo URL for header
- `chatLogo` - Logo URL for chat
- `backgroundImg` - Background image URL
- `inputPlaceholder` - Input field placeholder
- `disclaimerMessage` - Footer disclaimer

### AdminChatConfig

Advanced features and controls:
- `followUpPrompts` - Post-response suggestions
- `enableFeedback` - Show thumbs up/down
- `showFileUpload` - Enable file attachments
- `showWebSearch` - Display web search UI
- `showSources` - Show source citations
- `showTiles` - Display action tiles

Reference: See `lib/config/ChatConfig.ts` for complete configuration options.

## Backend Requirements

### Chat Endpoint

Your backend must implement a streaming chat endpoint:

```
POST /chat
Content-Type: application/json
Subscription-Key: your-key (optional)

Request Body:
{
  "id": "chat-session-id",
  "messages": [...],
  "model": "selected-model"
}

Response: Server-Sent Events stream
```

### Streaming Format

The backend should stream responses compatible with the AI SDK format. The frontend handles standard streaming patterns automatically.

Reference: See `components/chat.tsx` for streaming implementation.

## Authentication Methods

### 1. Subscription Key

Simple API key authentication:
```javascript
headers: {
  "Subscription-Key": endpointConfig.subscriptionKey
}
```

### 2. Custom Headers

Add additional headers as needed in your implementation.

## Error Handling

The system handles various connection scenarios:

1. **Backend Unreachable**: Falls back to error state
2. **Invalid Config**: Uses URL parameters or defaults
3. **Authentication Failed**: Shows appropriate error message

## Advanced Integration

### Dynamic Endpoint Resolution

For multi-tenant scenarios, implement custom endpoint resolution:

```
# GCP Cloud Run format
customer--project--app-xxxxxx-ey.a.run.app

# Azure API Management format
api.intellegam.com/customer/project/app/chat
```

Reference: See `parseEndpointIds` in `lib/utils/endpointUtils.ts`.

### Feature Flags

Control features via backend configuration:
- Enable/disable file uploads
- Show/hide web search
- Toggle feedback mechanisms

## Testing Your Integration

1. **Local Testing**
   - Run your backend on port 8000
   - Start the frontend with `pnpm dev`
   - The app auto-connects to local backend

2. **Remote Testing**
   - Deploy your backend
   - Access with `?endpoint=your-backend-url`
   - Verify streaming and configuration

3. **Configuration Testing**
   - Implement `/config` endpoint
   - Check UI updates based on config
   - Test feature toggles

## Best Practices

- Always implement CORS for browser access
- Use HTTPS in production
- Implement rate limiting
- Monitor streaming performance
- Cache configuration responses
- Handle connection timeouts gracefully

Reference: See `app/(chat)/` for implementation examples.