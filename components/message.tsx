'use client';

import { useChatSettingsContext } from '@/contexts/chat-config-context';
import type { Vote } from '@/lib/db/schema';
import {
  MessageAnnotationType,
  type SearchToolViewMessageAnnotation,
  ToolViewId,
} from '@/lib/types/annotations';
import { cn } from '@/lib/utils';
import { getMessageAnnotationsByTypeAndToolId } from '@/lib/utils/annotationUtils';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useRef, useState } from 'react';
import AssistantAvatar from './assistant-avatar';
import { DocumentToolCall, DocumentToolResult } from './document';
import { DocumentPreview } from './document-preview';
import { LoaderIcon, PencilEditIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';
import { MessageReasoning } from './message-reasoning';
import { PreviewAttachment } from './preview-attachment';
import { SearchToolComponent } from './search/search-tool';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Weather } from './weather';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const { chatConfig, adminChatConfig } = useChatSettingsContext();
  const messageRef = useRef<HTMLDivElement>(null);

  return (
    <AnimatePresence>
      <motion.div
        data-testid={`message-${message.role}`}
        className="group/message mx-auto px-4 w-full max-w-3xl"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <AssistantAvatar chatLogo={chatConfig.chatLogo} />
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div
                data-testid={`message-attachments`}
                className="flex flex-row justify-end gap-2"
              >
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.parts?.map((part, index) => {
              const { type } = part;
              const key = `message-${message.id}-part-${index}`;

              if (type === 'reasoning') {
                return (
                  <MessageReasoning
                    key={key}
                    isLoading={isLoading}
                    reasoning={part.reasoning}
                  />
                );
              }

              if (type === 'text') {
                if (mode === 'view') {
                  return (
                    <div key={key} className="flex flex-row items-start gap-2">
                      {message.role === 'user' && !isReadonly && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              data-testid="message-edit-button"
                              variant="ghost"
                              className="opacity-0 group-hover/message:opacity-100 px-2 rounded-full h-fit text-muted-foreground"
                              onClick={() => {
                                setMode('edit');
                              }}
                            >
                              <PencilEditIcon />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit message</TooltipContent>
                        </Tooltip>
                      )}

                      <div
                        data-testid="message-content"
                        className={cn('flex flex-col gap-4', {
                          'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                            message.role === 'user',
                        })}
                        ref={messageRef}
                      >
                        <Markdown>{part.text}</Markdown>
                      </div>
                    </div>
                  );
                }

                if (mode === 'edit') {
                  return (
                    <div key={key} className="flex flex-row items-start gap-2">
                      <div className="size-8" />

                      <MessageEditor
                        key={message.id}
                        message={message}
                        setMode={setMode}
                        setMessages={setMessages}
                        reload={reload}
                      />
                    </div>
                  );
                }
              }

              if (type === 'tool-invocation') {
                const { toolInvocation } = part;
                const { toolName, toolCallId, state } = toolInvocation;
                const toolViewAnnotations =
                  getMessageAnnotationsByTypeAndToolId(
                    message.annotations,
                    MessageAnnotationType.ToolView,
                    toolCallId,
                  );

                if (toolViewAnnotations) {
                  return (
                    <div key={toolCallId}>
                      {toolViewAnnotations.map((a) => {
                        if (
                          a.toolViewId === ToolViewId.WebSearch ||
                          a.toolViewId === ToolViewId.DatabaseSearch
                        ) {
                          return (
                            <SearchToolComponent
                              key={a.toolCallId + a.toolViewId}
                              toolCallId={a.toolCallId}
                              state={state}
                              annotation={a as SearchToolViewMessageAnnotation}
                              sourcesAnnotation={getMessageAnnotationsByTypeAndToolId(
                                message.annotations,
                                MessageAnnotationType.Sources,
                                toolCallId,
                              )}
                            />
                          );
                        }
                      })}
                    </div>
                  );
                }

                if (state === 'call') {
                  const { args } = toolInvocation;
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                }

                if (state === 'result') {
                  const { result } = toolInvocation;
                  return (
                    <div key={toolCallId}>
                      {toolName === 'getWeather' ? (
                        <Weather weatherAtLocation={result} />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview
                          isReadonly={isReadonly}
                          result={result}
                        />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolResult
                          type="update"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolResult
                          type="request-suggestions"
                          result={result}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                }
              }
            })}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                messageRef={messageRef}
                chatId={chatId}
                message={message}
                setMessages={setMessages}
                vote={vote}
                isLoading={isLoading}
                enableFeedback={adminChatConfig.enableFeedback}
                reload={reload}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.id !== nextProps.message.id) return false;
    if (prevProps.message.annotations !== nextProps.message.annotations)
      return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = ({ chatLogo }: { chatLogo?: string }) => {
  const role = 'assistant';
  return (
    <motion.div
      data-testid="message-assistant-loading"
      className="group/message mx-auto px-4 w-full max-w-3xl"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <AssistantAvatar chatLogo={chatLogo} />

        <div className="flex flex-col justify-center gap-2">
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
