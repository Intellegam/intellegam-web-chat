import { useChatSettingsContext } from '@/contexts/chat-config-context';
import { useMessages } from '@/hooks/use-messages';
import type { Vote } from '@/lib/db/schema';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { Greeting } from './greeting';
import { PreviewMessage, ThinkingMessage } from './message';
import MessageMap from './message-map';

interface MessagesProps {
  chatId: string;
  status: UseChatHelpers['status'];
  votes: Array<Vote> | undefined;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  status,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const {
    containerRef: messagesContainerRef,
    endRef: messagesEndRef,
    onViewportEnter,
    onViewportLeave,
    hasSentMessage,
  } = useMessages({
    chatId,
    status,
  });
  const { chatConfig } = useChatSettingsContext();

  return (
    <div
      ref={messagesContainerRef}
      className="relative flex flex-col flex-1 gap-6 pt-4 min-w-0 overflow-y-scroll"
    >
      {messages.length === 0 && (
        <Greeting startMessage={chatConfig.startMessage} />
      )}

      <div className="size-full @container absolute">
        <div className="hidden @md:block sticky top-1/2 mx-auto w-full pl-0 @3xl:pl-4 max-w-4xl -translate-y-1/2 pointer-events-none">
          <div className="pointer-events-auto flex">
            <MessageMap
              messages={messages}
              scrollContainerRef={messagesContainerRef}
            />
          </div>
        </div>
      </div>

      {messages.map((message, index) => (
        <PreviewMessage
          //TODO: the ids change to the steps_id which causes rerendering -Meris
          key={message.id}
          chatId={chatId}
          message={message}
          isLoading={status === 'streaming' && messages.length - 1 === index}
          vote={
            votes
              ? votes.find((vote) => vote.messageId === message.id)
              : undefined
          }
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          requiresScrollPadding={
            hasSentMessage && index === messages.length - 1
          }
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && (
          <ThinkingMessage chatLogo={chatConfig.chatLogo} />
        )}

      <motion.div
        ref={messagesEndRef}
        className="min-w-[24px] min-h-[24px] shrink-0"
        onViewportLeave={onViewportLeave}
        onViewportEnter={onViewportEnter}
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.status !== nextProps.status) return false;
  if (prevProps.status && nextProps.status) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
