/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

const mockConstructEvent = jest.fn().mockResolvedValue(true);

// Mock WorkOS (external service)
jest.mock('@workos-inc/node', () => ({
  WorkOS: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

describe('WorkOS Webhook Route (HTTP Layer)', () => {
  let handler: any;

  beforeAll(async () => {
    handler = await import('@/app/(auth)/api/webhooks/workos/route');
  });

  afterEach(async () => {
    mockConstructEvent.mockResolvedValue(true);
  });

  it('should reject requests without signature', async () => {
    await testApiHandler({
      appHandler: handler,
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
    mockConstructEvent.mockResolvedValue(false);

    await testApiHandler({
      appHandler: handler,
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

    // Re-import handler to use new env mock
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
