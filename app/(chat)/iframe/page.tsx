import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import {
  AdminChatConfig,
  ChatConfig,
  type EndpointConfig,
} from '@/lib/config/ChatConfig';
import { generateUUID } from '@/lib/utils';
import { fetchConfig } from '@/lib/utils/configUtils';
import { determineBackendEndpoint } from '@/lib/utils/endpointUtils';
import Image from 'next/image';

const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

//TODO search Params entweder EncryptionHelper oder hier bessere Types
export default async function Page({
  searchParams,
}: { searchParams: { endpoint: string } }) {
  const params = new URLSearchParams(await searchParams);
  const id = generateUUID();
  //const decryptedUrl = await EncryptionHelper.decryptURLSearchParams(searchParams, ENCRYPTED_PARAMS);
  const endpointConfig = await determineBackendEndpoint(params);
  const backendConfig = await fetchConfig(endpointConfig);
  const chatConfig =
    backendConfig?.chatConfig || ChatConfig.fromSearchParams(params);
  const adminChatConfig =
    backendConfig?.adminChatConfig || AdminChatConfig.fromSearchParams(params);

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
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedVisibilityType="private"
        isReadonly={false}
        isIframe={true}
        config={{
          adminChatConfig: adminChatConfig.toObject() as AdminChatConfig,
          endpointConfig: endpointConfig.toObject() as EndpointConfig,
          chatConfig: chatConfig.toObject() as ChatConfig,
        }}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
