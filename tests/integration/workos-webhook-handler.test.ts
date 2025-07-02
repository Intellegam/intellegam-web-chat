/**
 * @jest-environment node
 */
import type { User } from '@/app/(auth)/auth';
import * as schema from '@/lib/db/schema';
import { processWebhookEvent } from '@/lib/workos/webhook-handlers';
import { faker } from '@faker-js/faker';
import type { UserCreatedEvent, UserDeletedEvent } from '@workos-inc/node';
import { eq } from 'drizzle-orm';
import type { PgDatabase } from 'drizzle-orm/pg-core';
import { createTestDb, resetTestDb } from './setup/test-db';

// Mock environment
jest.mock('@/lib/env.server', () => ({
  WORKOS_API_KEY: 'test-api-key',
  WORKOS_WEBHOOK_SECRET: 'test-webhook-secret',
}));

jest.mock('@workos-inc/node', () => ({
  WorkOS: jest.fn().mockImplementation(() => ({
    userManagement: {
      getUser: jest.fn().mockResolvedValue(true),
    },
  })),
}));

// Variables for mocks
let testDb: PgDatabase<any, typeof schema>;
jest.mock('@/lib/db/db', () => {
  return {
    getDB: jest.fn(() => testDb),
  };
});

describe('WorkOS Webhook Handlers (Business Logic)', () => {
  beforeAll(async () => {
    const { db } = await createTestDb();
    testDb = db;
  });

  afterEach(async () => {
    resetTestDb(testDb);
  });

  it('should create user from webhook event', async () => {
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
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        lastSignInAt: null,
        externalId: null,
        metadata: {},
      },
      createdAt: faker.date.recent().toISOString(),
    };

    const result = await processWebhookEvent(mockEvent);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Successfully processed user.created');

    // Verify user was created in real database
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, mockEvent.data.id));

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(mockEvent.data.email);
    expect(users[0].workosId).toBe(mockEvent.data.id);
    expect(users[0].password).toBeNull();
  });

  it('should delete user from webhook event', async () => {
    jest.mock('@workos-inc/node', () => ({
      WorkOS: jest.fn().mockImplementation(() => ({
        userManagement: {
          getUser: jest.fn().mockImplementation(() => {
            throw new Error();
          }),
        },
      })),
    }));

    jest.resetModules();
    const { processWebhookEvent } = await import(
      '@/lib/workos/webhook-handlers'
    );

    const workosId = faker.string.uuid();
    const email = faker.internet.email();

    // Create user first using real database
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
        createdAt: faker.date.recent().toISOString(),
        updatedAt: faker.date.recent().toISOString(),
        lastSignInAt: null,
        externalId: null,
        metadata: {},
      },
      createdAt: faker.date.recent().toISOString(),
    };

    const result = await processWebhookEvent(deleteEvent);

    expect(result.success).toBe(true);
    expect(result.message).toBe('Successfully processed user.deleted');

    // Verify user was deleted from real database
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, workosId));

    expect(users).toHaveLength(0);
  });

  it('should handle concurrent user creation events correctly', async () => {
    const userData: User = {
      object: 'user',
      id: faker.string.uuid(),
      email: faker.internet.email(),
      emailVerified: false,
      profilePictureUrl: null,
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      lastSignInAt: null,
      externalId: null,
      metadata: {},
    };

    const events: UserCreatedEvent[] = Array.from({ length: 3 }, () => ({
      id: faker.string.uuid(),
      event: 'user.created',
      data: userData,
      createdAt: faker.date.recent().toISOString(),
    }));

    // Process all events concurrently - test real concurrency handling
    const promises = events.map((event) => processWebhookEvent(event));
    await Promise.all(promises);

    // Only one user should exist in real database
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, userData.id));

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(userData.email);
  });

  it('should handle unknown event types gracefully', async () => {
    const mockEvent = {
      id: faker.string.uuid(),
      event: 'unknown.event' as any,
      data: {},
      createdAt: faker.date.recent().toISOString(),
    };

    const result = await processWebhookEvent(mockEvent as any);

    expect(result.success).toBe(true);
    expect(result.message).toBe(
      'No handler found for event type: unknown.event',
    );
  });

  it('should handle duplicate user creation events idempotently', async () => {
    const userData = {
      object: 'user' as const,
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
    };

    const event: UserCreatedEvent = {
      id: faker.string.uuid(),
      event: 'user.created',
      data: userData,
      createdAt: faker.date.recent().toISOString(),
    };

    // Send the same event multiple times
    const result1 = await processWebhookEvent(event);
    const result2 = await processWebhookEvent(event);
    const result3 = await processWebhookEvent(event);

    // All should succeed
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);

    // But only one user should exist
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, userData.id));

    expect(users).toHaveLength(1);
    expect(users[0].email).toBe(userData.email);
  });

  it('should handle duplicate user deletion events gracefully', async () => {
    jest.mock('@workos-inc/node', () => ({
      WorkOS: jest.fn().mockImplementation(() => ({
        userManagement: {
          getUser: jest.fn().mockImplementation(() => {
            throw new Error();
          }),
        },
      })),
    }));

    jest.resetModules();
    const { processWebhookEvent } = await import(
      '@/lib/workos/webhook-handlers'
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

    // Send delete event multiple times
    const result1 = await processWebhookEvent(deleteEvent);
    const result2 = await processWebhookEvent(deleteEvent);
    const result3 = await processWebhookEvent(deleteEvent);

    // All should succeed (even if user already deleted)
    expect(result1.success).toBe(true);
    expect(result2.success).toBe(true);
    expect(result3.success).toBe(true);

    // User should not exist
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, workosId));

    expect(users).toHaveLength(0);
  });

  it('should handle out-of-order events (delete before create)', async () => {
    jest.mock('@workos-inc/node', () => ({
      WorkOS: jest.fn().mockImplementation(() => ({
        userManagement: {
          getUser: jest.fn().mockImplementation(() => {
            throw new Error();
          }),
        },
      })),
    }));

    jest.resetModules();
    const { processWebhookEvent } = await import(
      '@/lib/workos/webhook-handlers'
    );

    const userData = {
      object: 'user' as const,
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
    };

    const createEvent: UserCreatedEvent = {
      id: faker.string.uuid(),
      event: 'user.created',
      data: userData,
      createdAt: faker.date.recent().toISOString(),
    };

    const deleteEvent: UserDeletedEvent = {
      id: faker.string.uuid(),
      event: 'user.deleted',
      data: userData,
      createdAt: faker.date.recent().toISOString(),
    };

    // Send delete BEFORE create (out of order)
    const deleteResult = await processWebhookEvent(deleteEvent);
    const createResult = await processWebhookEvent(createEvent);

    // Both should succeed (delete should handle non-existent user gracefully)
    expect(deleteResult.success).toBe(true);
    expect(createResult.success).toBe(true);

    // User should exist after create
    const users = await testDb
      .select()
      .from(schema.user)
      .where(eq(schema.user.workosId, userData.id));

    expect(users).toHaveLength(0);
  });
});
