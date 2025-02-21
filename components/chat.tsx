'use client';

import type { Attachment, Message } from 'ai';
import { useEffect, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { ChatHeader } from '@/components/chat-header';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';

import { useArtifactSelector } from '@/hooks/use-artifact';
import { toast } from 'sonner';
import { Artifact } from './artifact';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import type { VisibilityType } from './visibility-selector';
import { useChat } from '@ai-sdk/react';
import type { AdminChatConfig, ChatConfig, EndpointConfig } from '@/lib/config/ChatConfig';

export function Chat({
  id,
  initialMessages,
  selectedVisibilityType,
  isReadonly,
  isIframe,
  config: {
    chatConfig, endpointConfig, adminChatConfig
  },
}: {
  id: string;
  initialMessages?: Array<Message>;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
  isIframe: boolean;
  config: {chatConfig: ChatConfig, endpointConfig: EndpointConfig, adminChatConfig: AdminChatConfig};
}) {
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { id},
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      //TODO: nicht im iframe oder dummy werte
      mutate('/api/history');
    },
    onError: (error) => {
      toast.error('An error occured, please try again!');
    },
  });

  const { data: votes } = useSWR<Array<Vote>>(
    `/api/vote?chatId=${id}`,
    fetcher,
    //TODO: remove this when voting system is implemented
    {revalidateOnMount: false}
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  useEffect(() => {
    console.log(chatConfig);
    
  })


  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        {!isIframe && <ChatHeader
          chatId={id}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />}

        <Messages
          chatId={id}
          startMessage={chatConfig.startMessage}
          chatLogo={chatConfig.chatLogo}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
          enableFeedback={adminChatConfig.enableFeedback}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
              isIframe={isIframe}
              startPrompts={chatConfig.startPrompts}
              showFileUpload={adminChatConfig.showFileUpload}
              showWebSearch={adminChatConfig.showWebSearch}
              poweredBy={adminChatConfig.poweredBy}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
