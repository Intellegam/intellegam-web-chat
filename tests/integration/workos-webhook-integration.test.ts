/**
 * @jest-environment node
 */
import * as schema from '@/lib/db/schema';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { testApiHandler } from 'next-test-api-route-handler';
import { createTestDb, resetTestDb } from './setup/test-db';
import type { UserCreatedEvent, UserDeletedEvent } from '@workos-inc/node';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

// Variables for mocks
let testDb: any;
const mockConstructEvent = jest.fn().mockResolvedValue(true);

// Mock WorkOS (external service)
jest.mock('@workos-inc/node', () => ({
  WorkOS: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: mockConstructEvent,
    },
  })),
}));

// Mock drizzle to use test database
jest.mock('drizzle-orm/postgres-js', () => {
  const actual = jest.requireActual('drizzle-orm/postgres-js');
  return {
    ...actual,
    drizzle: jest.fn(() => testDb),
  };
});

describe('WorkOS Webhook Integration (End-to-End)', () => {
  let handler: any;

  beforeAll(async () => {
    const { db } = await createTestDb();
    testDb = db;
    handler = await import('@/app/(auth)/api/webhooks/workos/route');
  });

  afterEach(async () => {
    resetTestDb(testDb);
    mockConstructEvent.mockResolvedValue(true);
  });

  it('should process user creation webhook end-to-end', async () => {
    const mockEvent: UserCreatedEvent = {
      id: faker.string.uuid(),
      event: 'user.created',
      data: {
        object: 'user',
        id: faker.string.uuid(),
        email: faker.internet.email(),
        emailVerified: false,
        profilePictureUrl: null,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        lastSignInAt: null,
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        externalId: null,
        metadata: {},
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

        // Verify end-to-end database operation
        const users = await testDb
          .select()
          .from(schema.user)
          .where(eq(schema.user.workosId, mockEvent.data.id));

        expect(users).toHaveLength(1);
        expect(users[0].email).toBe(mockEvent.data.email);
      },
    });
  });

  it('should process user deletion webhook end-to-end', async () => {
    const workosId = faker.string.uuid();
    const email = faker.internet.email();

    // Create user first
    await testDb.insert(schema.user).values({
      email: email,
      workosId: workosId,
      password: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const deleteEvent: UserDeletedEvent = {
      id: faker.string.uuid(),
      event: 'user.deleted',
      data: {
        object: 'user',
        id: workosId,
        email: email,
        emailVerified: false,
        profilePictureUrl: null,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        lastSignInAt: null,
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        externalId: null,
        metadata: {},
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

        // Verify user was deleted
        const users = await testDb
          .select()
          .from(schema.user)
          .where(eq(schema.user.workosId, workosId));

        expect(users).toHaveLength(0);
      },
    });
  });
});
