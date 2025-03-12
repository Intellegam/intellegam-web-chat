import type { ChatRequestOptions, JSONValue, Message } from 'ai';
import { PreviewMessage, ThinkingMessage } from './message';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Overview } from './overview';
import React, { memo, useEffect, useState } from 'react';
import type { Vote } from '@/lib/db/schema';
import equal from 'fast-deep-equal';
import { useChatSettingsContext } from '@/contexts/chat-config-context';
import BackendActions from './backend-actions';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  data?: Array<JSONValue>;
  setData: (
    data:
      | JSONValue[]
      | undefined
      | ((data: JSONValue[] | undefined) => JSONValue[] | undefined),
  ) => void;
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
  data,
  setData,
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

  //TODO: this definitely needs a refactor and proper parsing of the data
  useEffect(() => {
    if (data && data?.length > 0) {
      const actions = data
        .filter(
          (item): item is { action: string } =>
            item !== null &&
            typeof item === 'object' &&
            'action' in item &&
            typeof item.action === 'string',
        )
        .map((item) => item.action);

      if (actions.length > 0) {
        // Find the last user message ID
        const lastUserMessage = [...messages]
          .reverse()
          .find((msg) => msg.role === 'user');

        if (lastUserMessage?.id) {
          setBackendActions((prev) => ({
            ...prev,
            [lastUserMessage.id]: actions,
          }));
        }
        // reset Data
        setData([
          ...data.filter(
            (item) =>
              (item !== null &&
                typeof item === 'object' &&
                !('action' in item)) ||
              typeof item !== 'object',
          ),
        ]);
      }
    }
  }, [data, isLoading, messages, setData]);

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
          {message.role === 'user' && backendActions[message.id] && (
            <BackendActions
              actions={backendActions[message.id]}
              messageId={message.id}
            />
          )}
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
