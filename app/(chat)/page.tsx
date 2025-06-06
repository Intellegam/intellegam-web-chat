import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { ChatSettingsProvider } from '@/contexts/chat-config-context';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import type {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { EncryptionHelper } from '@/lib/config/EncryptionHelper';
import { generateUUID } from '@/lib/utils';
import { getChatConfigs } from '@/lib/utils/configUtils';
import { withAuth } from '@workos-inc/authkit-nextjs';
import { cookies } from 'next/headers';

const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

export default async function Page({
  searchParams,
}: { searchParams: Promise<{ endpoint: string }> }) {
  const session = await withAuth({ ensureSignedIn: false });

  // This check is handled by middleware, but adding for type safety
  if (!session?.user) {
    return null; // Middleware will redirect to /start
  }

  const id = generateUUID();
  const chatParams = new URLSearchParams(await searchParams);
  const decryptedSearchParams = await EncryptionHelper.decryptURLSearchParams(
    chatParams,
    ENCRYPTED_PARAMS,
  );
  const { endpointConfig, chatConfig, adminChatConfig } = await getChatConfigs(
    decryptedSearchParams,
  );

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('chat-model');

  if (!modelIdFromCookie) {
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
            key={id}
            id={id}
            initialMessages={[]}
            initialChatModel={DEFAULT_CHAT_MODEL}
            initialVisibilityType="private"
            isReadonly={false}
            session={session}
            autoResume={false}
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
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={modelIdFromCookie.value}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler id={id} />
      </ChatSettingsProvider>
    </>
  );
}
