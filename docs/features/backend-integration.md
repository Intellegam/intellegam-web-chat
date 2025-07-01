# Backend Integration Guide

## Overview

The AI chat application connects to a custom backend for AI processing. The backend handles message streaming, configuration, and all AI-related functionality.

## Connection Methods

### URL Parameters

The application determines backend connection through URL parameters:
- `endpoint` - Backend URL
- `subscriptionKey` - Optional authentication key

Parameters can be encrypted for production use.

Reference: See `lib/config/EncryptionHelper.ts` for encryption handling.

### Automatic Environment Detection

In development, the system checks for a local backend at `http://127.0.0.1:8000` before falling back to configured endpoints.

Reference: See `lib/utils/endpointUtils.ts` for endpoint resolution.

## Configuration System

### Dynamic UI Configuration

The backend can control UI behavior through a `/config` endpoint. This allows backends to customize the chat interface without frontend changes.

### Configuration Classes

Three classes manage application configuration:

**EndpointConfig** - Backend connection settings
**ChatConfig** - UI appearance and messaging
**AdminChatConfig** - Feature toggles and advanced settings

Reference: See `lib/config/ChatConfig.ts` for available options.

## Backend Requirements

### Chat Endpoint

The backend must implement a streaming chat endpoint that:
- Accepts messages in Vercel AI SDK format
- Returns Server-Sent Events (SSE) stream
- Handles authentication via headers

### Configuration Endpoint (Optional)

A `/config` endpoint can provide dynamic UI configuration. When available, this overrides URL parameter configuration.

## Message Handling

### Request Format

The frontend sends standard Vercel AI SDK message format including:
- Complete message history
- User and assistant messages
- Message parts (text, tool invocations)
- File attachments as base64 data URLs

Reference: See `app/(chat)/api/chat/schema.ts` for message validation.

### File Attachments

Images are embedded directly in messages as base64-encoded data URLs. The backend receives these in the `experimental_attachments` field.

Supported formats:
- image/png
- image/jpeg
- image/jpg

### Streaming Responses

The backend should stream responses using Server-Sent Events compatible with Vercel AI SDK. The frontend handles all standard streaming patterns automatically.

## Authentication

When configured, a subscription key is sent as a header to all backend requests. This provides simple API key authentication.

## Advanced Features

### Multi-Tenant Support

The system can parse various endpoint URL formats for multi-tenant deployments, including GCP Cloud Run and Azure API Management patterns.

Reference: See `parseEndpointIds` in `lib/utils/endpointUtils.ts`.

### Resumable Streaming

With Redis configured, chat streams can resume after connection interruptions. This requires the `REDIS_URL` environment variable.

### Feature Control

The backend configuration controls which features are enabled:
- File uploads
- Web search UI
- Feedback buttons
- Source citations
- Follow-up prompts

## Testing Integration

### Local Development
The application automatically connects to `localhost:8000` when available, simplifying local backend development.

### Remote Testing
Use URL parameters to connect to deployed backends and verify streaming functionality.

### Configuration Validation
Implement the `/config` endpoint to test dynamic UI configuration.

## Implementation Notes

- CORS must be configured for browser access
- HTTPS required in production
- Streaming timeouts should be handled gracefully
- Configuration responses benefit from caching

Reference: See `components/chat.tsx` for frontend streaming handling.
