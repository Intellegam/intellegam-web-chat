import { deleteUserByWorkOSId, upsertUser } from '@/lib/db/queries';
import serverEnv from '@/lib/env.server';
import {
  WorkOS,
  type Event,
  type UserCreatedEvent,
  type UserDeletedEvent,
} from '@workos-inc/node';

const workos = new WorkOS(serverEnv.WORKOS_API_KEY);

export async function handleUserCreated(
  event: UserCreatedEvent,
): Promise<void> {
  const userData = event.data;
  let isUserNotFound = false;
  try {
    //we just call the api to check if there is a user
    // if not then it was deleted and the user.created webhook came after that event
    await workos.userManagement.getUser(event.data.id);
  } catch (error: any) {
    //UserNotFoundException so we dont create the user in our DB because it was already deleted
    isUserNotFound = true;
  }
  if (isUserNotFound) {
    console.log(
      `Webhook(user.created): User does not exists in WorkOS anymore ${userData.email} and was not created`,
    );
    return;
  }

  // if the user exists we use that information because it is the latest one
  await upsertUser({
    email: userData.email,
    password: null,
    workosId: userData.id,
    createdAt: new Date(userData.createdAt),
    updatedAt: new Date(userData.updatedAt),
  });

  console.log(`Webhook(user.created): Upserted ${userData.email}`);
}

export async function handleUserDeleted(
  event: UserDeletedEvent,
): Promise<void> {
  const userData = event.data;
  let isUserNotFound = false;
  try {
    //we just call the api to check if there is a user
    // if a user still exists in workos then this event should be ignored
    await workos.userManagement.getUser(event.data.id);
  } catch (error: any) {
    // UserNotFoundException means the user is deleted in workos so we can safely delete him here
    isUserNotFound = true;
  }
  if (isUserNotFound) {
    await deleteUserByWorkOSId(userData.id);
    console.log(`Webhook(user.deleted): User ${userData.email} deleted`);
  } else {
    console.log(
      `Webhook(user.deleted): User still exists in WorkOS {userData.email} and was not deleted`,
    );
  }
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
