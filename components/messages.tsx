import { useChatSettingsContext } from '@/contexts/chat-config-context';
import type { Vote } from '@/lib/db/schema';
import type { ActionItem } from '@/lib/types/custom-data';
import type { ChatRequestOptions, JSONValue, Message } from 'ai';
import equal from 'fast-deep-equal';
import React, { memo, useEffect, useState } from 'react';
import BackendActions from './backend-actions';
import { PreviewMessage, ThinkingMessage } from './message';
import { Overview } from './overview';
import { useScrollToBottom } from './use-scroll-to-bottom';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  isArtifactVisible: boolean;
}

function PureMessages({
  chatId,
  isLoading,
  votes,
  messages,
  setMessages,
  reload,
  isReadonly,
}: MessagesProps) {
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();
  const { chatConfig } = useChatSettingsContext();
  const [backendActions, setBackendActions] = useState<{
    [messageId: string]: string[];
  }>({});

  function safelyParseBackendAction(data: JSONValue): ActionItem | null {
    // Check if it's an object (not null, array, or primitive)
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return null;
    }

    // Try to destructure the action property
    const { action } = data;

    // Validate the action property is a string
    if (typeof action !== 'string') {
      return null;
    }

    // Return the destructured and validated action
    return { action };
  }
  useEffect(() => {
    console.log(
      messages.forEach((m) =>
        console.log(m.annotations?.map((a) => safelyParseBackendAction(a))),
      ),
    );
  });

  return (
    <div
      ref={messagesContainerRef}
      className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
    >
      {messages.length === 0 && chatConfig.startMessage && (
        <Overview startMessage={chatConfig.startMessage} />
      )}

      {messages.map((message, index) => (
        <React.Fragment key={message.id}>
          {message.annotations && (
            <BackendActions
              actions={message.annotations
                .map((a) => safelyParseBackendAction(a))
                .filter((a) => a !== null)}
              messageId={message.id}
            />
          )}
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messages.length - 1 === index}
            vote={
              votes
                ? votes.find((vote) => vote.messageId === message.id)
                : undefined
            }
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        </React.Fragment>
      ))}

      {isLoading &&
        messages.length > 0 &&
        messages[messages.length - 1].role === 'user' && (
          <ThinkingMessage chatLogo={chatConfig.chatLogo} />
        )}

      <div
        ref={messagesEndRef}
        className="shrink-0 min-w-[24px] min-h-[24px]"
      />
    </div>
  );
}

export const Messages = memo(PureMessages, (prevProps, nextProps) => {
  if (prevProps.isArtifactVisible && nextProps.isArtifactVisible) return true;

  if (prevProps.isLoading !== nextProps.isLoading) return false;
  if (prevProps.isLoading && nextProps.isLoading) return false;
  if (prevProps.messages.length !== nextProps.messages.length) return false;
  if (!equal(prevProps.messages, nextProps.messages)) return false;
  if (!equal(prevProps.votes, nextProps.votes)) return false;

  return true;
});
