import {
  createUser,
  deleteUserByWorkOSId,
  getUserByWorkOSId,
} from '@/lib/db/queries';
import type {
  Event,
  UserCreatedEvent,
  UserDeletedEvent,
} from '@workos-inc/node';

async function shouldProcessUserEvent(
  userId: string,
  eventTimestamp: Date,
): Promise<{ shouldProcess: boolean; reason?: string }> {
  try {
    const existingUser = await getUserByWorkOSId(userId);

    // If event is older than last processed, it's stale
    if (existingUser?.updatedAt && eventTimestamp <= existingUser.updatedAt) {
      return {
        shouldProcess: false,
        reason: `Stale event: Last processed ${existingUser.updatedAt.toISOString()}, current ${eventTimestamp.toISOString()}`,
      };
    }

    return { shouldProcess: true };
  } catch (error) {
    console.error(
      `Error checking if user event should be processed for user ${userId}:`,
      error,
    );
    return { shouldProcess: false, reason: `Error checking event: ${error}` };
  }
}

export async function handleUserCreated(
  event: UserCreatedEvent,
): Promise<void> {
  const userData = event.data;
  const eventTimestamp = new Date(event.createdAt);

  // Check if this event should be processed
  const { shouldProcess, reason } = await shouldProcessUserEvent(
    userData.id,
    eventTimestamp,
  );

  if (!shouldProcess) {
    console.log(
      `Webhook: Skipping user.created event for ${userData.email}: ${reason}`,
    );
    return;
  }

  await createUser(
    userData.email,
    null,
    userData.id,
    userData.createdAt ? new Date(userData.createdAt) : undefined,
    userData.updatedAt ? new Date(userData.updatedAt) : undefined,
  );

  console.log(`Webhook: Created user ${userData.email}`);
}

export async function handleUserDeleted(
  event: UserDeletedEvent,
): Promise<void> {
  const userData = event.data;
  const eventTimestamp = new Date(event.createdAt);

  // Check if this event should be processed
  const { shouldProcess, reason } = await shouldProcessUserEvent(
    userData.id,
    eventTimestamp,
  );

  if (!shouldProcess) {
    console.log(
      `Webhook: Skipping user.deleted event for ${userData.email}: ${reason}`,
    );
    return;
  }

  await deleteUserByWorkOSId(userData.id);
  console.log(`Webhook: User deleted ${userData.email}`);
}

type WebhookHandler<T extends Event> = (event: T) => Promise<void>;

const webhookHandlers: Record<string, WebhookHandler<any>> = {
  'user.created': handleUserCreated,
  'user.deleted': handleUserDeleted,
};

export async function processWebhookEvent(
  event: Event,
): Promise<{ success: boolean; message: string }> {
  try {
    const handler = webhookHandlers[event.event];

    if (!handler) {
      const message = `No handler found for event type: ${event.event}`;
      console.log(`Webhook: ${message}`);
      return { success: true, message };
    }

    await handler(event);
    return { success: true, message: `Successfully processed ${event.event}` };
  } catch (error) {
    const message = `Failed to process event ${event.event}: ${error}`;
    console.error(`Webhook: ${message}`);
    throw new Error(message);
  }
}
