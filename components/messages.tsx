import { useChatSettingsContext } from '@/contexts/chat-config-context';
import type { Vote } from '@/lib/db/schema';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import equal from 'fast-deep-equal';
import { memo, useEffect } from 'react';
import { PreviewMessage, ThinkingMessage } from './message';
import { Overview } from './overview';
import { useScrollToBottom } from './use-scroll-to-bottom';
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
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const { chatConfig } = useChatSettingsContext();

  useEffect(() => {
    //TODO: this needs a refactor this is just the first pass
    const lastUserMessage = messages.filter((m) => m.role === 'user').at(-1);
    if (
      !messagesContainerRef.current ||
      !messagesEndRef.current ||
      !lastUserMessage
    ) {
      return;
    }
    console.log(messages);

    const lastUserMessageIndex = messages.findIndex(
      (m) => m.id === lastUserMessage.id,
    );
    const lastAssistantMessage = messages[lastUserMessageIndex + 1];
    if (!lastAssistantMessage) return;

    const lastUserMessageElement = document.getElementById(lastUserMessage.id);
    const lastAssistantMessageElement = document.getElementById(
      lastAssistantMessage.id,
    );

    if (!lastAssistantMessageElement || !lastUserMessageElement) return;
    const combinedHeight =
      lastUserMessageElement?.clientHeight +
      lastAssistantMessageElement?.clientHeight;
    console.log(combinedHeight);

    //TODO: i hard coded to subtract 16px from the pt-4 and 24 px twice for the gap above the user message and the gap under the user message
    // if its possible i would get these values from somewhere else but i am not sure how yet
    if (combinedHeight <= messagesContainerRef.current.clientHeight) {
      messagesEndRef.current.style.height = `${messagesContainerRef.current.clientHeight - combinedHeight - 16 - 24 - 24}px`;
    } else {
      messagesEndRef.current.style.height = '24px';
    }
  });

  return (
    <div
      ref={messagesContainerRef}
      id="messages-container"
      className="relative flex flex-col flex-1 gap-6 pt-4 min-w-0 overflow-y-scroll"
    >
      {messages.length === 0 && chatConfig.startMessage && (
        <Overview startMessage={chatConfig.startMessage} />
      )}

      <div className="hidden md:block top-1/2 left-1/2 z-10 fixed ml-4 px-4 max-w-4xl size-full -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="top-1/2 left-0 absolute -translate-y-1/2 pointer-events-auto">
          <MessageMap messages={messages} />
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
        />
      ))}

      {status === 'submitted' &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && (
          <ThinkingMessage chatLogo={chatConfig.chatLogo} />
        )}

      <div
        ref={messagesEndRef}
        className="min-w-[24px] min-h-[24px] shrink-0"
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
