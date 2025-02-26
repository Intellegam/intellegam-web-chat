import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { ChatSettingsProvider } from '@/contexts/chat-config-context';
import type {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { generateUUID } from '@/lib/utils';
import { getChatConfigs } from '@/lib/utils/configUtils';
import Image from 'next/image';

const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

//TODO search Params entweder EncryptionHelper oder hier bessere Types
export default async function Page({
  searchParams,
}: { searchParams: { endpoint: string } }) {
  const id = generateUUID();
  const params = new URLSearchParams(await searchParams);
  //const decryptedUrl = await EncryptionHelper.decryptURLSearchParams(searchParams, ENCRYPTED_PARAMS);
  const { endpointConfig, chatConfig, adminChatConfig } =
    await getChatConfigs(params);

  return (
    <>
      {chatConfig.backgroundImg && (
        <div className="fixed left-0 top-0 z-[-1] size-full blur-0">
          <div className="absolute left-0 top-0 size-full bg-background/95" />
          <Image
            width={0}
            height={0}
            sizes="100vh"
            src={chatConfig.backgroundImg}
            className="size-full min-h-screen object-cover"
            alt=""
          />
        </div>
      )}
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
