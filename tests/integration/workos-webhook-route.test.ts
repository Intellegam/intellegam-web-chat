/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';

// biome-ignore lint/style/noVar: we need var so the hoisting works -> https://github.com/kulshekhar/ts-jest/issues/3292#issuecomment-1221105233
var mockConstructEvent: jest.Mock;
jest.mock('@workos-inc/node', () => {
  mockConstructEvent = jest.fn();
  return {
    WorkOS: jest.fn().mockImplementation(() => ({
      webhooks: {
        constructEvent: mockConstructEvent,
      },
    })),
  };
});

import * as appHandler from '@/app/(auth)/api/webhooks/workos/route';
import serverEnv from '@/lib/env.server';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  __esModule: true,
  default: {
    WORKOS_API_KEY: 'test-api-key',
    WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
  },
}));

describe('WorkOS Webhook Route (HTTP Layer)', () => {
  beforeEach(() => {
    mockConstructEvent.mockResolvedValue(true);
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
    mockConstructEvent.mockResolvedValue(false);
    await testApiHandler({
      appHandler: appHandler,
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
    serverEnv.WORKOS_WEBHOOK_SECRET = undefined;

    await testApiHandler({
      appHandler: appHandler,
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
