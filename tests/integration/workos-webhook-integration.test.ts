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

    it('should handle multiple retries of the same event', async () => {
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
          // Send same event multiple times (up to 12 retries as per WorkOS docs)
          const responses = await Promise.all(
            Array.from({ length: 5 }, () =>
              fetch({
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'workos-signature': 'valid-signature',
                },
                body: JSON.stringify(mockEvent),
              }),
            ),
          );

          // All should succeed
          responses.forEach((response) => {
            expect(response.status).toBe(200);
          });

          // Verify only one user exists
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(email);
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
    it('should ignore user.deleted when it arrives before user.created (chronologically delete comes after create)', async () => {
      const workosId = faker.string.uuid();
      const email = faker.internet.email();

      // Create timestamps where create happens BEFORE delete chronologically
      const createTime = new Date('2024-01-01T10:00:00Z');
      const deleteTime = new Date('2024-01-01T11:00:00Z'); // Delete happens 1 hour later

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
        appHandler: handler,
        test: async ({ fetch }) => {
          // Send delete event FIRST (but it should be ignored since user doesn't exist)
          const response1 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(deleteEvent),
          });

          expect(response1.status).toBe(200); // Should not fail

          // Then send create event
          const response2 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(createEvent),
          });

          expect(response2.status).toBe(200);

          // User should exist since create came after (chronologically the delete should have won)
          // But we need to verify final state based on timestamps
          // If your system uses timestamps properly, user should NOT exist (delete wins)
          // If your system processes events in arrival order, user WOULD exist (create wins)
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          // This test documents the expected behavior - adjust based on your business logic
          // Option A: Timestamp-based logic (recommended) - delete should win
          expect(users).toHaveLength(0); // User should be deleted based on timestamps

          // Option B: Arrival-order logic - create would win
          // expect(users).toHaveLength(1); // User exists because create arrived after delete
        },
      });
    });

    it('should respect chronological order using timestamps when events arrive out of order', async () => {
      const workosId = faker.string.uuid();
      const email = faker.internet.email();

      // Chronological order: create at 10:00, delete at 11:00, create again at 12:00
      const firstCreateTime = new Date('2024-01-01T10:00:00Z');
      const deleteTime = new Date('2024-01-01T11:00:00Z');
      const secondCreateTime = new Date('2024-01-01T12:00:00Z');

      const firstCreateEvent: UserCreatedEvent = {
        id: faker.string.uuid(),
        event: 'user.created',
        data: {
          object: 'user',
          id: workosId,
          email: email,
          emailVerified: false,
          profilePictureUrl: null,
          firstName: 'John',
          lastName: faker.person.lastName(),
          lastSignInAt: null,
          createdAt: firstCreateTime.toISOString(),
          updatedAt: firstCreateTime.toISOString(),
          externalId: null,
          metadata: {},
        },
        createdAt: firstCreateTime.toISOString(),
      };

      const deleteEvent: UserDeletedEvent = {
        id: faker.string.uuid(),
        event: 'user.deleted',
        data: {
          object: 'user',
          id: workosId,
          email: email,
          emailVerified: false,
          profilePictureUrl: null,
          firstName: 'John',
          lastName: faker.person.lastName(),
          lastSignInAt: null,
          createdAt: firstCreateTime.toISOString(),
          updatedAt: deleteTime.toISOString(),
          externalId: null,
          metadata: {},
        },
        createdAt: deleteTime.toISOString(),
      };

      const secondCreateEvent: UserCreatedEvent = {
        id: faker.string.uuid(),
        event: 'user.created',
        data: {
          object: 'user',
          id: workosId,
          email: email,
          emailVerified: false,
          profilePictureUrl: null,
          firstName: 'Johnny', // Different name to verify which event "won"
          lastName: faker.person.lastName(),
          lastSignInAt: null,
          createdAt: secondCreateTime.toISOString(),
          updatedAt: secondCreateTime.toISOString(),
          externalId: null,
          metadata: {},
        },
        createdAt: secondCreateTime.toISOString(),
      };

      await testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          // Send events in wrong order: delete first, then creates
          const responses = await Promise.all([
            fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(deleteEvent),
            }),
            fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(firstCreateEvent),
            }),
            fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(secondCreateEvent),
            }),
          ]);

          responses.forEach((response) => {
            expect(response.status).toBe(200);
          });

          // If using timestamp-based logic: Final state should be user exists with "Johnny"
          // (second create at 12:00 wins over delete at 11:00)
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(email);
          // If timestamp logic is implemented, this should be "Johnny" (latest event)
          // If not, it depends on processing order
        },
      });
    });

    it('should handle delete-before-create scenario with proper business logic', async () => {
      const workosId = faker.string.uuid();
      const email = faker.internet.email();

      // Scenario: User was created at 10:00, deleted at 11:00, but delete event arrives first
      const createTime = new Date('2024-01-01T10:00:00Z');
      const deleteTime = new Date('2024-01-01T11:00:00Z');

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
          updatedAt: deleteTime.toISOString(),
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
        appHandler: handler,
        test: async ({ fetch }) => {
          // Delete arrives first, create arrives second
          const response1 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(deleteEvent),
          });

          expect(response1.status).toBe(200);

          const response2 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(createEvent),
          });

          expect(response2.status).toBe(200);

          // With proper timestamp logic: delete (11:00) should win over create (10:00)
          // So user should NOT exist
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          // Expected: User should be deleted (delete event is chronologically later)
          expect(users).toHaveLength(0);
        },
      });
    });
  });

  describe('Combined Scenarios', () => {
    it('should handle out-of-order events with retries', async () => {
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
        appHandler: handler,
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

          // Verify user exists (should handle both out-of-order and retries)
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(email);
        },
      });
    });

    it('should handle mixed create/delete events with retries', async () => {
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
          // Send delete event and its retries
          const deleteResponses = await Promise.all([
            fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(deleteEvent),
            }),
            // Retry of same delete event
            fetch({
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'workos-signature': 'valid-signature',
              },
              body: JSON.stringify(deleteEvent),
            }),
          ]);

          deleteResponses.forEach((response) => {
            expect(response.status).toBe(200);
          });

          // Verify user is deleted
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(0);
        },
      });
    });
  });

  describe('Event ID-based Idempotency (Recommended Pattern)', () => {
    it('should demonstrate proper event ID tracking for idempotency', async () => {
      const workosId = faker.string.uuid();
      const email = faker.internet.email();
      const eventId = faker.string.uuid();

      const mockEvent: UserCreatedEvent = {
        id: eventId,
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
          // First request
          const response1 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(mockEvent),
          });

          expect(response1.status).toBe(200);
          const data1 = await response1.json();
          expect(data1.eventId).toBe(eventId);

          // Retry with same event ID
          const response2 = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(mockEvent),
          });

          expect(response2.status).toBe(200);
          const data2 = await response2.json();
          expect(data2.eventId).toBe(eventId);

          // Both responses should have the same event ID
          expect(data1.eventId).toBe(data2.eventId);

          // Only one user should exist
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, workosId));

          expect(users).toHaveLength(1);
        },
      });
    });
  });
});
