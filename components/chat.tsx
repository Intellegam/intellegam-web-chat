'use client';

import { ChatHeader } from '@/components/chat-header';
import { useChatSettingsContext } from '@/contexts/chat-config-context';
import { useViewConfig } from '@/contexts/view-config-context';
import { useArtifactSelector } from '@/hooks/use-artifact';
import type { Vote } from '@/lib/db/schema';
import { fetcher, generateUUID } from '@/lib/utils';
import { useChat } from '@ai-sdk/react';
import type { Attachment, UIMessage } from 'ai';
import { useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';
import { Artifact } from './artifact';
import { Messages } from './messages';
import { MultimodalInput } from './multimodal-input';
import type { VisibilityType } from './visibility-selector';

export function Chat({
  id,
  initialMessages,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();
  const viewConfig = useViewConfig();
  const { chatConfig, endpointConfig } = useChatSettingsContext();

  const voteUrl = viewConfig.isIframe ? null : `/api/vote?chatId=${id}`;
  const { data: votes } = useSWR<Array<Vote>>(voteUrl, fetcher);

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    status,
    stop,
    reload,
  } = useChat({
    id,
    body: { id },
    api: endpointConfig.endpoint,
    headers: {
      ...(endpointConfig.subscriptionKey
        ? { 'Subscription-Key': endpointConfig.subscriptionKey }
        : {}),
      'X-Preferred-Stream-Protocol': 'VERCEL_AI_DATA_STREAM_V1',
    },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true,
    generateId: generateUUID,
    onFinish: () => {
      //TODO: currently no history/ chat persistence in the backend
      // mutate('/api/history');
    },
    onError: () => {
      toast.error('An error occured, please try again!');
    },
  });

  return (
    <>
      <div
        className={`flex flex-col min-w-0 h-dvh ${chatConfig.backgroundImg ? '' : 'bg-background'} py-1 px-2`}
      >
        <ChatHeader
          chatId={id}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex gap-2 mx-auto px-4 pb-4 md:pb-6 w-full md:max-w-4xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        status={status}
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
