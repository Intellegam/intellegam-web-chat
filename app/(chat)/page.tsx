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

const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

export default async function Page({
  searchParams,
}: { searchParams: Promise<{ endpoint: string }> }) {
  const id = generateUUID();
  const chatParams = new URLSearchParams(await searchParams);
  const decryptedSearchParams = await EncryptionHelper.decryptURLSearchParams(
    chatParams,
    ENCRYPTED_PARAMS,
  );
  const { endpointConfig, chatConfig, adminChatConfig } = await getChatConfigs(
    decryptedSearchParams,
  );

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
          selectedVisibilityType="private"
          isReadonly={false}
        />
      </ChatSettingsProvider>
      <DataStreamHandler id={id} />
    </>
  );
}
