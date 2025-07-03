/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';

import * as schema from '@/lib/db/schema';
import * as handler from '@/app/(auth)/api/webhooks/workos/route';
import { faker } from '@faker-js/faker';
import { eq } from 'drizzle-orm';
import { createTestDb, resetTestDb } from './setup/test-db';
import type { UserCreatedEvent, UserDeletedEvent } from '@workos-inc/node';
import type { PgDatabase } from 'drizzle-orm/pg-core';

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

jest.mock('@/lib/workos/webhook-handler-helper', () => ({
  doesUserExistInWorkOS: jest.fn().mockResolvedValue(true),
}));

let testDb: PgDatabase<any, typeof schema>;
jest.mock('@/lib/db/db', () => {
  return {
    getDB: jest.fn(() => testDb),
  };
});

describe('WorkOS Webhook Integration (End-to-End)', () => {
  beforeAll(async () => {
    const { db } = await createTestDb();
    testDb = db;
  });

  afterEach(async () => {
    resetTestDb(testDb);
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
    jest.mock('@/lib/workos/webhook-handler-helper', () => ({
      doesUserExistInWorkOS: jest.fn().mockResolvedValue(false),
    }));
    jest.resetModules();
    const handlerWithoutUser = await import(
      '@/app/(auth)/api/webhooks/workos/route'
    );
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
      appHandler: handlerWithoutUser,
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

/**
 * Test cases for duplicate events (retries) and out-of-order events
 * Add these to your existing test file
 */

describe('WorkOS Webhook Edge Cases', () => {
  beforeAll(async () => {
    const { db } = await createTestDb();
    testDb = db;
  });

  afterEach(async () => {
    resetTestDb(testDb);
  });

  describe('Duplicate Events (Retry Scenarios)', () => {
    it('should handle retried user.created events (same event ID)', async () => {
      const workosId = faker.string.uuid();
      const email = faker.internet.email();

      const mockEvent: UserCreatedEvent = {
        id: faker.string.uuid(),
        event: 'user.created',
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
          // Send original event
          const response1 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(mockEvent),
          });

          expect(response1.status).toBe(200);

          // Send exact same event again (retry scenario - same event ID)
          const response2 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(mockEvent),
          });

          expect(response2.status).toBe(200);

          // Verify only one user exists (upsert should handle the duplicate)
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(email);
          expect(users[0].workosId).toBe(workosId);
        },
      });
    });

    it('should handle retried user.deleted events (same event ID)', async () => {
      jest.mock('@/lib/workos/webhook-handler-helper', () => ({
        doesUserExistInWorkOS: jest.fn().mockResolvedValue(false),
      }));
      jest.resetModules();
      const handlerWithoutUser = await import(
        '@/app/(auth)/api/webhooks/workos/route'
      );

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
        appHandler: handlerWithoutUser,
        test: async ({ fetch }) => {
          // Send original delete event
          const response1 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(deleteEvent),
          });

          expect(response1.status).toBe(200);

          // Send exact same delete event again (retry scenario)
          const response2 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(deleteEvent),
          });

          expect(response2.status).toBe(200);

          // Verify user is still deleted (deleteUserByWorkOSId should handle non-existent user gracefully)
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(0);
        },
      });
    });

    it('should handle concurrent retries of the same event', async () => {
      const workosId = faker.string.uuid();
      const email = faker.internet.email();

      const mockEvent: UserCreatedEvent = {
        id: faker.string.uuid(),
        event: 'user.created',
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
          // Send same event concurrently (simulating race condition during retries)
          const concurrentRequests = Array(3)
            .fill(null)
            .map(() =>
              fetch({
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'workos-signature': 'valid-signature',
                },
                body: JSON.stringify(mockEvent),
              }),
            );

          const responses = await Promise.all(concurrentRequests);

          responses.forEach((response) => {
            expect(response.status).toBe(200);
          });

          // Verify only one user exists despite concurrent requests
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(email);
        },
      });
    });
  });

  describe('Out-of-Order Events (Business Logic Should Make Sense)', () => {
    it('should not create user when user.deleted arrives before user.created', async () => {
      jest.mock('@/lib/workos/webhook-handler-helper', () => ({
        doesUserExistInWorkOS: jest.fn().mockResolvedValue(false),
      }));

      jest.resetModules();
      const handlerWithoutUser = await import(
        '@/app/(auth)/api/webhooks/workos/route'
      );

      const workosId = faker.string.uuid();
      const email = faker.internet.email();

      // Create timestamps where create happens BEFORE delete chronologically
      const createTime = new Date('2024-01-01T10:00:00Z');
      const deleteTime = new Date('2024-01-01T10:00:01Z');

      // But events arrive in wrong order - delete arrives first
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
          createdAt: createTime.toISOString(),
          updatedAt: deleteTime.toISOString(), // User was "deleted" at this time
          externalId: null,
          metadata: {},
        },
        createdAt: deleteTime.toISOString(),
      };

      const createEvent: UserCreatedEvent = {
        id: faker.string.uuid(),
        event: 'user.created',
        data: {
          object: 'user',
          id: workosId,
          email: email,
          emailVerified: false,
          profilePictureUrl: null,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          lastSignInAt: null,
          createdAt: createTime.toISOString(),
          updatedAt: createTime.toISOString(),
          externalId: null,
          metadata: {},
        },
        createdAt: createTime.toISOString(),
      };

      await testApiHandler({
        appHandler: handlerWithoutUser,
        test: async ({ fetch }) => {
          // Send delete event FIRST
          const deleteResponse = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(deleteEvent),
          });

          expect(deleteResponse.status).toBe(200); // Should not fail

          // Then send create event
          const createResponse = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(createEvent),
          });

          expect(createResponse.status).toBe(200);

          // User should not exist since it does not exists in workos
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          //delete should win
          expect(users).toHaveLength(0);
        },
      });
    });

    describe('Combined Scenarios', () => {
      it('should handle out-of-order events with retries', async () => {
        jest.mock('@/lib/workos/webhook-handler-helper', () => ({
          doesUserExistInWorkOS: jest.fn().mockResolvedValue(false),
        }));

        jest.resetModules();
        const handlerWithoutUser = await import(
          '@/app/(auth)/api/webhooks/workos/route'
        );
        const workosId = faker.string.uuid();
        const email = faker.internet.email();

        const userData = {
          object: 'user' as const,
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
        };

        // Delete event arrives first
        const deleteEvent: UserDeletedEvent = {
          id: faker.string.uuid(),
          event: 'user.deleted',
          data: userData,
          createdAt: faker.date.recent().toISOString(),
        };

        // Create event that gets retried
        const createEvent: UserCreatedEvent = {
          id: faker.string.uuid(),
          event: 'user.created',
          data: userData,
          createdAt: faker.date.recent().toISOString(),
        };

        await testApiHandler({
          appHandler: handlerWithoutUser,
          test: async ({ fetch }) => {
            // Send delete first
            const deleteResponse = await fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(deleteEvent),
            });

            expect(deleteResponse.status).toBe(200);

            // Send create event
            const createResponse = await fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(createEvent),
            });

            expect(createResponse.status).toBe(200);

            // Send create retry (same event ID)
            const retryResponse = await fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(createEvent),
            });

            expect(retryResponse.status).toBe(200);

            const users = await testDb
              .select()
              .from(schema.user)
              .where(eq(schema.user.workosId, workosId));

            expect(users).toHaveLength(0);
          },
        });
      });
    });
  });
});
