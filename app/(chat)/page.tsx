import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import type {
  AdminChatConfig,
  ChatConfig,
  EndpointConfig,
} from '@/lib/config/ChatConfig';
import { generateUUID } from '@/lib/utils';
import { getChatConfigs } from '@/lib/utils/configUtils';

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
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedVisibilityType="private"
        isReadonly={false}
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
