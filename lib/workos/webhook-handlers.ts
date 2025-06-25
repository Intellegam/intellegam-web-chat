import { deleteUserByWorkOSId, upsertUser } from '@/lib/db/queries';
import type {
  Event,
  UserCreatedEvent,
  UserDeletedEvent,
} from '@workos-inc/node';

export async function handleUserCreated(
  event: UserCreatedEvent,
): Promise<void> {
  const userData = event.data;

  //Timestamps can be undefined because the schema defines Date.now() as a default value
  await upsertUser({
    email: userData.email,
    password: null,
    workosId: userData.id,
    createdAt: userData.createdAt ? new Date(userData.createdAt) : undefined,
    updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : undefined,
  });

  console.log(`Webhook(user.created): Upserted ${userData.email}`);
}

export async function handleUserDeleted(
  event: UserDeletedEvent,
): Promise<void> {
  const userData = event.data;

  await deleteUserByWorkOSId(userData.id);
  console.log(`Webhook(user.deleted): User ${userData.email} deleted`);
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
