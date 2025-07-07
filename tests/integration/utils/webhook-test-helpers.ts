// tests/integration/utils/webhook-test-helpers.ts
import { faker } from '@faker-js/faker';
import type { UserCreatedEvent, UserDeletedEvent } from '@workos-inc/node';

export interface TestUserData {
  workosId: string;
  email: string;
  firstName: string;
  lastName: string;
}

export function createTestUserData(
  overrides?: Partial<TestUserData>,
): TestUserData {
  return {
    workosId: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    ...overrides,
  };
}

export function createUserCreatedEvent(
  userData?: Partial<TestUserData>,
): UserCreatedEvent {
  const user = createTestUserData(userData);

  return {
    id: faker.string.uuid(),
    event: 'user.created',
    data: {
      object: 'user',
      id: user.workosId,
      email: user.email,
      emailVerified: false,
      profilePictureUrl: null,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      lastSignInAt: null,
      externalId: null,
      metadata: {},
    },
    createdAt: faker.date.recent().toISOString(),
  };
}

export function createUserDeletedEvent(
  userData?: Partial<TestUserData>,
): UserDeletedEvent {
  const user = createTestUserData(userData);

  return {
    id: faker.string.uuid(),
    event: 'user.deleted',
    data: {
      object: 'user',
      id: user.workosId,
      email: user.email,
      emailVerified: false,
      profilePictureUrl: null,
      firstName: user.firstName,
      lastName: user.lastName,
      createdAt: faker.date.recent().toISOString(),
      updatedAt: faker.date.recent().toISOString(),
      lastSignInAt: null,
      externalId: null,
      metadata: {},
    },
    createdAt: faker.date.recent().toISOString(),
  };
}
