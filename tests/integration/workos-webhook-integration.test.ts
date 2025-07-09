/**
 * @jest-environment node
 */
import { testApiHandler } from 'next-test-api-route-handler';

import * as handler from '@/app/(auth)/api/webhooks/workos/route';
import * as schema from '@/lib/db/schema';
import { doesUserExistInWorkOS } from '@/lib/workos/webhook-handler-helper';
import type { PGlite } from '@electric-sql/pglite';
import { eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { createTestDb, resetTestDb } from './setup/test-db';
import {
  createUserCreatedEvent,
  createUserDeletedEvent,
  type TestUserData,
} from './utils/webhook-test-helpers';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

// Mock WorkOS SDK
jest.mock('@workos-inc/node', () => ({
  WorkOS: jest.fn().mockImplementation(() => ({
    webhooks: {
      constructEvent: jest.fn().mockResolvedValue(true),
    },
  })),
}));

// Mock WorkOS helper
jest.mock('@/lib/workos/webhook-handler-helper', () => ({
  doesUserExistInWorkOS: jest.fn(),
}));

const mockDoesUserExistInWorkOS = doesUserExistInWorkOS as jest.MockedFunction<
  typeof doesUserExistInWorkOS
>;

let testDb: PgDatabase<any, typeof schema>;
let testClient: PGlite;

// Mock database
jest.mock('@/lib/db/db', () => ({
  getDB: jest.fn(() => testDb),
}));

describe('WorkOS Webhook Integration (End-to-End)', () => {
  beforeAll(async () => {
    const { db, client } = await createTestDb();
    testDb = db;
    testClient = client;
  });

  afterEach(async () => {
    await resetTestDb(testDb);
  });

  afterAll(async () => {
    if (testClient) {
      await testClient.close();
    }
  });

  describe('End-to-End Webhook Processing', () => {
    it('should process user creation webhook through full HTTP pipeline', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);
      const mockEvent = createUserCreatedEvent();

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

    it('should process user deletion webhook through full HTTP pipeline', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(false);
      const userData: TestUserData = {
        workosId: 'delete-test-id',
        email: 'delete@example.com',
        firstName: 'Delete',
        lastName: 'Test',
      };

      // Create user first
      await testDb.insert(schema.user).values({
        email: userData.email,
        workosId: userData.workosId,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const deleteEvent = createUserDeletedEvent(userData);

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
            .where(eq(schema.user.workosId, userData.workosId));

          expect(users).toHaveLength(0);
        },
      });
    });
  });

  describe('Retry and Idempotency Scenarios', () => {
    it('should handle webhook retries with idempotency', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);
      const userData: TestUserData = {
        workosId: 'test-workos-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockEvent = createUserCreatedEvent(userData);

      await testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          const requestBody = JSON.stringify(mockEvent);
          const headers = {
            'Content-Type': 'application/json',
            'workos-signature': 'valid-signature',
          };

          // Send original event
          const response1 = await fetch({
            method: 'POST',
            headers,
            body: requestBody,
          });

          expect(response1.status).toBe(200);

          // Send exact same event again (retry scenario)
          const response2 = await fetch({
            method: 'POST',
            headers,
            body: requestBody,
          });

          expect(response2.status).toBe(200);

          // Verify only one user exists (upsert should handle the duplicate)
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, userData.workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(userData.email);
        },
      });
    });

    it('should handle concurrent webhook processing', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);
      const userData: TestUserData = {
        workosId: 'concurrent-test-id',
        email: 'concurrent@example.com',
        firstName: 'Concurrent',
        lastName: 'Test',
      };
      const mockEvent = createUserCreatedEvent(userData);

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
            .where(eq(schema.user.workosId, userData.workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(userData.email);
        },
      });
    });

    it('should handle retried deletion events idempotently', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(false);
      const userData: TestUserData = {
        workosId: 'retry-delete-id',
        email: 'retry-delete@example.com',
        firstName: 'Retry',
        lastName: 'Delete',
      };

      // Create user first
      await testDb.insert(schema.user).values({
        email: userData.email,
        workosId: userData.workosId,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const deleteEvent = createUserDeletedEvent(userData);

      await testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          const requestBody = JSON.stringify(deleteEvent);
          const headers = {
            'Content-Type': 'application/json',
            'workos-signature': 'valid-signature',
          };

          // Send original delete event
          const response1 = await fetch({
            method: 'POST',
            headers,
            body: requestBody,
          });

          expect(response1.status).toBe(200);

          // Send exact same delete event again (retry scenario)
          const response2 = await fetch({
            method: 'POST',
            headers,
            body: requestBody,
          });

          expect(response2.status).toBe(200);

          // Verify user is still deleted
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, userData.workosId));

          expect(users).toHaveLength(0);
        },
      });
    });
  });

  describe('Complex Webhook Scenarios', () => {
    it('should handle out-of-order events with different timestamps correctly', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);
      const userDataOld: TestUserData = {
        workosId: 'test-workos-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
      };
      const mockEventOld = createUserCreatedEvent(userDataOld);

      const newUpdateAt = new Date(mockEventOld.data.updatedAt);
      newUpdateAt.setMinutes(newUpdateAt.getMinutes() + 3);
      const userDataNew: TestUserData = {
        workosId: 'test-workos-id',
        email: 'test-new@example.com',
        firstName: 'Test',
        lastName: 'User',
        updatedAt: newUpdateAt.toISOString(),
      };
      const mockEventNew = createUserCreatedEvent(userDataNew);

      await testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          const headers = {
            'Content-Type': 'application/json',
            'workos-signature': 'valid-signature',
          };

          // Send newer event first
          const response1 = await fetch({
            method: 'POST',
            headers,
            body: JSON.stringify(mockEventNew),
          });

          expect(response1.status).toBe(200);

          // Send older event second
          const response2 = await fetch({
            method: 'POST',
            headers,
            body: JSON.stringify(mockEventOld),
          });

          expect(response2.status).toBe(200);

          // Verify newer data is preserved
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, userDataOld.workosId));

          expect(users).toHaveLength(1);
          expect(users[0].email).toBe(userDataNew.email);
          expect(users[0].updatedAt.toISOString()).toBe(userDataNew.updatedAt);
        },
      });
    });

    it('should handle delete event arriving before create event', async () => {
      const userData: TestUserData = {
        workosId: 'out-of-order-id',
        email: 'out-of-order@example.com',
        firstName: 'Out',
        lastName: 'Order',
      };

      // Delete event arrives first (user doesn't exist in WorkOS)
      mockDoesUserExistInWorkOS.mockResolvedValue(false);
      const deleteEvent = createUserDeletedEvent(userData);

      await testApiHandler({
        appHandler: handler,
        test: async ({ fetch }) => {
          // Send delete event first
          const deleteResponse = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(deleteEvent),
          });

          expect(deleteResponse.status).toBe(200);

          // Then send create event (user still doesn't exist in WorkOS)
          const createEvent = createUserCreatedEvent(userData);
          const createResponse = await fetch({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'workos-signature': 'valid-signature',
            },
            body: JSON.stringify(createEvent),
          });

          expect(createResponse.status).toBe(200);

          // User should not exist since they don't exist in WorkOS
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, userData.workosId));

          expect(users).toHaveLength(0);
        },
      });
    });

    it('should handle WorkOS state verification edge cases', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);
      const userData: TestUserData = {
        workosId: 'still-exists-id',
        email: 'still-exists@example.com',
        firstName: 'Still',
        lastName: 'Exists',
      };

      // Create user first
      await testDb.insert(schema.user).values({
        email: userData.email,
        workosId: userData.workosId,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const deleteEvent = createUserDeletedEvent(userData);

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

          // User should still exist since they exist in WorkOS
          const users = await testDb
            .select()
            .from(schema.user)
            .where(eq(schema.user.workosId, userData.workosId));

          expect(users).toHaveLength(1);
        },
      });
    });
  });
});