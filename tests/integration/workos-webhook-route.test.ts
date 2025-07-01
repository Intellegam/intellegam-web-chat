/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';

import * as appHandler from '@/app/(auth)/api/webhooks/workos/route';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

jest.mock('@workos-inc/node', () => ({
  WorkOS: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn().mockResolvedValue(true),
    },
  })),
}));

describe('WorkOS Webhook Route (HTTP Layer)', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should reject requests without signature', async () => {
    await testApiHandler({
      appHandler: appHandler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Missing signature' });
      },
    });
  });

  it('should reject invalid signatures', async () => {
    jest.doMock('@workos-inc/node', () => ({
      WorkOS: jest.fn().mockImplementation(() => ({
        webhooks: {
          constructEvent: jest.fn().mockResolvedValue(false), // <- false for this test
        },
      })),
    }));

    // Reset and re-import like you already do in test 3
    jest.resetModules();
    const handlerWithInvalidSig = await import(
      '@/app/(auth)/api/webhooks/workos/route'
    );

    await testApiHandler({
      appHandler: handlerWithInvalidSig,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'workos-signature': 'invalid-signature',
          },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(401);
        const data = await response.json();
        expect(data).toEqual({ error: 'Invalid signature' });
      },
    });
  });

  it('should handle webhook secret missing', async () => {
    // Temporarily mock env without webhook secret
    jest.doMock('@/lib/env.server', () => ({
      WORKOS_API_KEY: 'test-api-key',
      WORKOS_WEBHOOK_SECRET: undefined,
    }));

    // Re-import appHandler to use new env mock
    jest.resetModules();
    const handlerWithoutSecret = await import(
      '@/app/(auth)/api/webhooks/workos/route'
    );

    await testApiHandler({
      appHandler: handlerWithoutSecret,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'workos-signature': 'signature',
          },
          body: JSON.stringify({}),
        });

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual({ error: 'Webhook secret required' });
      },
    });
  });
});
