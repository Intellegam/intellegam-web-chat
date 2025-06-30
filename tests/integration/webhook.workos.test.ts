/**
 * @jest-environment node
 */
import * as schema from '@/lib/db/schema';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { testApiHandler } from 'next-test-api-route-handler'; // Must be first import
import { createTestDb, resetTestDb } from './setup/test-db';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

// Mock WorkOS to always validate signatures
const mockConstructEvent = jest.fn().mockResolvedValue(true);
jest.mock('@workos-inc/node', () => ({
  WorkOS: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

jest.mock('bcrypt-ts', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true),
  genSalt: jest.fn().mockResolvedValue('salt'),
  genSaltSync: jest.fn().mockReturnValue('salt'),
  hashSync: jest.fn().mockReturnValue('hashed-password'),
  compareSync: jest.fn().mockReturnValue(true),
}));

jest.mock('postgres', () => {
  return jest.fn(() => ({
    connect: jest.fn(),
    end: jest.fn(),
  }));
});

jest.mock('drizzle-orm/postgres-js', () => {
  const actual = jest.requireActual('drizzle-orm/postgres-js');
  return {
    ...actual,
    drizzle: jest.fn(),
  };
});

describe('WorkOS Webhook Integration Tests with PGlite', () => {
  let testDb: any;
  let handler: any;

  beforeAll(async () => {
    const { db } = await createTestDb();
    testDb = db;

    // Import drizzle and set up mock
    const drizzleModule = await import('drizzle-orm/postgres-js');
    const mockDrizzle = drizzleModule.drizzle as jest.Mock;

    // Set up the mock return value
    mockDrizzle.mockReturnValue(testDb);

    // NOW import handler
    handler = await import('@/app/(auth)/api/webhooks/workos/route');
  });

  afterEach(async () => {
    resetTestDb(testDb);
    mockConstructEvent.mockResolvedValue(true);
  });

  it('should create user in database via webhook', async () => {
    const mockEvent = {
      id: faker.string.uuid(),
      event: 'user.created',
      data: {
        id: faker.string.uuid(),
        email: faker.internet.email(),
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
      },
      createdAt: faker.date.recent().toISOString(),
    };

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'workos-signature': 'valid-signature',
          },
          body: JSON.stringify(mockEvent),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual({
          success: true,
          message: 'Successfully processed user.created',
          eventId: mockEvent.id,
          eventType: mockEvent.event,
        });

        // Verify user was actually created in PGlite database
        const users = await testDb
          .select()
          .from(schema.user)
          .where(eq(schema.user.workosId, mockEvent.data.id));

        expect(users).toHaveLength(1);
        expect(users[0].email).toBe(mockEvent.data.email);
        expect(users[0].workosId).toBe(mockEvent.data.id);
        expect(users[0].password).toBeNull();
      },
    });
  });

  it('should delete user from database via webhook', async () => {
    const userData = {
      email: faker.internet.email(),
      workosId: faker.string.uuid(),
    };

    // Create user first in PGlite
    await testDb.insert(schema.user).values({
      email: userData.email,
      workosId: userData.workosId,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Verify user exists
    let users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, userData.workosId));
    expect(users).toHaveLength(1);

    // Send delete webhook
    const deleteEvent = {
      id: faker.string.uuid(),
      event: 'user.deleted',
      data: {
        id: userData.workosId,
        email: userData.email,
      },
      createdAt: faker.date.recent().toISOString(),
    };

    await testApiHandler({
      appHandler: handler,
      test: async ({ fetch }) => {
        const response = await fetch({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'workos-signature': 'valid-signature',
          },
          body: JSON.stringify(deleteEvent),
        });

        expect(response.status).toBe(200);

        const data = await response.json();
        expect(data).toEqual({
          success: true,
          message: 'Successfully processed user.deleted',
          eventId: deleteEvent.id,
          eventType: deleteEvent.event,
        });

        // Verify user was actually deleted from PGlite database
        users = await testDb
          .select()
          .from(schema.user)
          .where(eq(schema.user.workosId, userData.workosId));

        expect(users).toHaveLength(0);
      },
    });
  });

  it('should handle concurrent webhook events correctly', async () => {
    const userData = {
      id: faker.string.uuid(),
      email: faker.internet.email(),
    };

    const events = Array.from({ length: 3 }, () => ({
      id: faker.string.uuid(),
      event: 'user.created',
      data: userData,
      createdAt: faker.date.recent().toISOString(),
    }));

    // Process all webhooks concurrently
    const promises = events.map((event) =>
      testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(event),
          });

          // Check response inside the test callback
          expect(response.status).toBe(200);
        },
      }),
    );

    await Promise.all(promises);

    // Only one user should exist in PGlite database
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, userData.id));

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(userData.email);
  });

  describe('Security and Error Handling', () => {
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

          console.info(response);

          expect(response.status).toBe(401);
          const data = await response.json();
          expect(data).toEqual({ error: 'Invalid signature' });
        },
      });
    });

    it('should handle unknown event types gracefully', async () => {
      const mockEvent = {
        id: faker.string.uuid(),
        event: 'unknown.event',
        data: {},
        createdAt: faker.date.recent().toISOString(),
      };

      await testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(mockEvent),
          });

          expect(response.status).toBe(200);
          const data = await response.json();
          expect(data).toEqual({
            success: true,
            message: 'No handler found for event type: unknown.event',
            eventId: mockEvent.id,
            eventType: mockEvent.event,
          });
        },
      });
    });
  });
});
