import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { ChatSettingsProvider } from '@/contexts/chat-config-context';
import type {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { EncryptionHelper } from '@/lib/config/EncryptionHelper';
import { generateUUID } from '@/lib/utils';
import { getChatConfigs } from '@/lib/utils/configUtils';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '../(auth)/auth';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { ENCRYPTED_PARAMS } from '@/lib/utils/encryptionUtils';

export default async function Page({
  searchParams,
}: { searchParams: Promise<{ endpoint: string }> }) {
  const session = await auth();

  if (!session) {
    redirect('/api/auth/guest');
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
