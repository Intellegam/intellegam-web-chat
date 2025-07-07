// tests/integration/workos-webhook-handler.test.ts
/**
 * @jest-environment node
 */

import * as schema from '@/lib/db/schema';
import { doesUserExistInWorkOS } from '@/lib/workos/webhook-handler-helper';
import { processWebhookEvent } from '@/lib/workos/webhook-handlers';
import type { PGlite } from '@electric-sql/pglite';
import type { WorkOS } from '@workos-inc/node';
import { eq } from 'drizzle-orm';
import { createTestDb, resetTestDb } from './setup/test-db';
import {
  createUserCreatedEvent,
  createUserDeletedEvent,
} from './utils/webhook-test-helpers';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

// Mock WorkOS helper - moved to top and setup before importing processWebhookEvent
jest.mock('@/lib/workos/webhook-handler-helper', () => ({
  doesUserExistInWorkOS: jest.fn(),
}));

let testDb: any;
let testClient: PGlite;

// Mock database
jest.mock('@/lib/db/db', () => ({
  getDB: jest.fn(() => testDb),
}));

// Get the mocked function
const mockDoesUserExistInWorkOS = doesUserExistInWorkOS as jest.MockedFunction<
  typeof doesUserExistInWorkOS
>;

describe('WorkOS Webhook Handler', () => {
  let mockWorkOS: WorkOS;

  beforeAll(async () => {
    const { db, client } = await createTestDb();
    testDb = db;
    testClient = client;

    // Create simple WorkOS object to pass to the function
    mockWorkOS = {} as WorkOS;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await resetTestDb(testDb);
  });

  afterAll(async () => {
    if (testClient) {
      await testClient.close();
    }
  });

  describe('User Creation', () => {
    it('should create user successfully', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);

      const event = createUserCreatedEvent();
      const result = await processWebhookEvent(event, mockWorkOS);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed user.created');

      const users = await testDb
        .select()
        .from(schema.user)
        .where(eq(schema.user.workosId, event.data.id));

      expect(users).toHaveLength(1);
      expect(users[0].email).toBe(event.data.email);
      expect(users[0].workosId).toBe(event.data.id);
      expect(users[0].password).toBeNull();
    });

    it('should handle idempotent user creation', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);

      const event = createUserCreatedEvent();

      // Create user multiple times
      await processWebhookEvent(event, mockWorkOS);
      await processWebhookEvent(event, mockWorkOS);
      const result = await processWebhookEvent(event, mockWorkOS);

      expect(result.success).toBe(true);

      // Should only have one user
      const users = await testDb
        .select()
        .from(schema.user)
        .where(eq(schema.user.workosId, event.data.id));

      expect(users).toHaveLength(1);
    });

    it('should not create user when user does not exist in WorkOS', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(false);

      const event = createUserCreatedEvent();
      const result = await processWebhookEvent(event, mockWorkOS);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed user.created');

      const users = await testDb
        .select()
        .from(schema.user)
        .where(eq(schema.user.workosId, event.data.id));

      expect(users).toHaveLength(0);
    });
  });

  describe('User Deletion', () => {
    it('should delete user successfully', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(false);

      const userData = {
        workosId: 'test-workos-id',
        email: 'test@example.com',
      };
      const event = createUserDeletedEvent(userData);

      // Create user first
      await testDb.insert(schema.user).values({
        email: userData.email,
        workosId: userData.workosId,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await processWebhookEvent(event, mockWorkOS);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed user.deleted');

      const users = await testDb
        .select()
        .from(schema.user)
        .where(eq(schema.user.workosId, userData.workosId));

      expect(users).toHaveLength(0);
    });

    it('should handle deletion of non-existent user', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(false);

      const event = createUserDeletedEvent();
      const result = await processWebhookEvent(event, mockWorkOS);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed user.deleted');
    });

    it('should not delete user when user still exists in WorkOS', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);

      const userData = {
        workosId: 'test-workos-id',
        email: 'test@example.com',
      };
      const event = createUserDeletedEvent(userData);

      // Create user first
      await testDb.insert(schema.user).values({
        email: userData.email,
        workosId: userData.workosId,
        password: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await processWebhookEvent(event, mockWorkOS);

      expect(result.success).toBe(true);
      expect(result.message).toBe('Successfully processed user.deleted');

      // User should still exist
      const users = await testDb
        .select()
        .from(schema.user)
        .where(eq(schema.user.workosId, userData.workosId));

      expect(users).toHaveLength(1);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent user creation', async () => {
      mockDoesUserExistInWorkOS.mockResolvedValue(true);

      const userData = {
        workosId: 'test-workos-id',
        email: 'test@example.com',
      };
      const events = Array.from({ length: 3 }, () =>
        createUserCreatedEvent(userData),
      );

      const results = await Promise.all(
        events.map((event) => processWebhookEvent(event, mockWorkOS)),
      );

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });

      const users = await testDb
        .select()
        .from(schema.user)
        .where(eq(schema.user.workosId, userData.workosId));

      expect(users).toHaveLength(1);
    });
  });

  describe('Unknown Events', () => {
    it('should handle unknown event types', async () => {
      const unknownEvent: any = {
        id: 'test-id',
        event: 'unknown.event',
        data: {},
        createdAt: new Date().toISOString(),
      };

      const result = await processWebhookEvent(unknownEvent, mockWorkOS);

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        'No handler found for event type: unknown.event',
      );
    });
  });
});
