import { notFound, redirect } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { ChatSettingsProvider } from '@/contexts/chat-config-context';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { guestRegex } from '@/lib/constants';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import type { DBMessage } from '@/lib/db/schema';
import { getChatConfigs } from '@/lib/utils/configUtils';
import { withAuth } from '@workos-inc/authkit-nextjs';
import type { Attachment, UIMessage } from 'ai';
import { cookies } from 'next/headers';

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

  const session = await withAuth({ ensureSignedIn: true });

  if (guestRegex.test(session.user.email)) {
    redirect('/api/auth/logout');
  }

  if (chat.visibility === 'private') {
    if (!session.user) {
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

  const cookieStore = await cookies();
  const chatModelFromCookie = cookieStore.get('chat-model');

  if (!chatModelFromCookie) {
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
            initialChatModel={DEFAULT_CHAT_MODEL}
            initialVisibilityType={chat.visibility}
            isReadonly={session?.user?.id !== chat.userId}
            session={session}
            autoResume={true}
          />
          <DataStreamHandler id={id} />
        </ChatSettingsProvider>
      </>
    );
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
          initialChatModel={chatModelFromCookie.value}
          initialVisibilityType={chat.visibility}
          isReadonly={session?.user?.id !== chat.userId}
          session={session}
          autoResume={true}
        />
        <DataStreamHandler id={id} />
      </ChatSettingsProvider>
    </>
  );
}
