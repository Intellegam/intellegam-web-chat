'use server';

import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getChatById,
  getMessageById,
  updateChatVisiblityById,
} from '@/lib/db/queries';
import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import { saveChat, saveMessages } from '@/lib/db/queries';
import { auth } from '../(auth)/auth';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function saveMessage({
  chatId,
  message,
  visibility,
}: {
  chatId: string;
  message: UIMessage;
  visibility: VisibilityType;
}) {
  try {
    const session = await auth();

    if (!session?.user) {
      return {
        success: false,
        error: 'Unauthorized',
      };
    }

    const chat = await getChatById({ id: chatId });
    console.info(message);

    // Only create a new chat if:
    // 1. Chat doesn't exist yet
    // 2. Message is from the user (not assistant)
    if (!chat && message.role === 'user') {
      const title = await generateTitleFromUserMessage({ message });

      await saveChat({
        id: chatId,
        userId: session.user.id,
        title,
        visibility,
      });
    } else if (chat && chat.userId !== session.user.id) {
      // Check permissions for existing chat
      return {
        success: false,
        error: 'Forbidden - you do not own this chat',
      };
    }

    // For assistant messages, we need to handle the step_ prefix
    // TODO: should we save step too? -meris
    const messageId =
      message.role === 'assistant'
        ? message.id.replace('step_', '')
        : message.id;

    // Save the message
    await saveMessages({
      messages: [
        {
          chatId,
          id: messageId,
          role: message.role,
          parts: message.parts || [],
          attachments: message.experimental_attachments || [],
          createdAt: message.createdAt || new Date(),
        },
      ],
    });

    return {
      success: true,
      message: chat ? 'Message saved' : 'Chat created and message saved',
    };
  } catch (error) {
    console.error('Error saving message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
