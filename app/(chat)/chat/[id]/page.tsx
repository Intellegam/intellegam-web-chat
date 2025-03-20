import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { ChatSettingsProvider } from '@/contexts/chat-config-context';
import type {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { getChatConfigs } from '@/lib/utils/configUtils';
import type { DBMessage } from '@/lib/db/schema';
import type { Attachment, UIMessage } from 'ai';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const chat = await getChatById({ id });
  const urlParams = new URLSearchParams(await props.params);
  //const decryptedUrl = await EncryptionHelper.decryptURLSearchParams(searchParams, ENCRYPTED_PARAMS);
  const { endpointConfig, chatConfig, adminChatConfig } =
    await getChatConfigs(urlParams);

  if (!chat) {
    notFound();
  }

  const session = await auth();

  if (chat.visibility === 'private') {
    if (!session || !session.user) {
      return notFound();
    }

    if (session.user.id !== chat.userId) {
      return notFound();
    }
  }

  const messagesFromDb = await getMessagesByChatId({
    id,
  });

  function convertToUIMessages(messages: Array<DBMessage>): Array<UIMessage> {
    return messages.map((message) => ({
      id: message.id,
      parts: message.parts as UIMessage['parts'],
      role: message.role as UIMessage['role'],
      // Note: content will soon be deprecated in @ai-sdk/react
      content: '',
      createdAt: message.createdAt,
      experimental_attachments:
        (message.attachments as Array<Attachment>) ?? [],
    }));
  }

  return (
    <>
      <ChatSettingsProvider
        config={{
          adminChatConfig: adminChatConfig.toObject() as AdminChatConfig,
          endpointConfig: endpointConfig.toObject() as EndpointConfig,
          chatConfig: chatConfig.toObject() as ChatConfig,
        }}
      >
        <Chat
          id={chat.id}
          initialMessages={convertToUIMessages(messagesFromDb)}
          selectedVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
        />
      </ChatSettingsProvider>

      <DataStreamHandler id={id} />
    </>
  );
}
