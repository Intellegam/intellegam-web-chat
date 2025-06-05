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
import { guestRegex } from '@/lib/constants';
import { generateUUID } from '@/lib/utils';
import { getChatConfigs } from '@/lib/utils/configUtils';
import { withAuth } from '@workos-inc/authkit-nextjs';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const ENCRYPTED_PARAMS = ['subscriptionKey', 'subscription_key'];

//TODO: better types for searchParams -Meris
export default async function Page({
  searchParams,
}: { searchParams: Promise<{ endpoint: string }> }) {
  const id = generateUUID();
  const session = await withAuth();
  console.info(session);

  if (session.user === null || !guestRegex.test(session.user.email)) {
    redirect('/api/auth/guest');
  }
  //TODO: the below could be refactored/extracted as it is used in chat/page.tsx too -Meris
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
      {chatConfig.backgroundImg && (
        <div className="top-0 left-0 z-[-1] fixed blur-0 size-full">
          <div className="top-0 left-0 absolute bg-background/95 size-full" />
          <Image
            width={0}
            height={0}
            sizes="100vh"
            src={chatConfig.backgroundImg}
            className="min-h-screen size-full object-cover"
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
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          autoResume={false}
        />
      </ChatSettingsProvider>
      <DataStreamHandler id={id} />
    </>
  );
}
