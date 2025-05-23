import { deleteTrailingMessages } from '@/app/(chat)/actions';
import { useViewConfig } from '@/contexts/view-config-context';
import type { Vote } from '@/lib/db/schema';
import { MessageAnnotationType } from '@/lib/types/annotations';
import { getMessageAnnotationsByType } from '@/lib/utils/annotationUtils';
import type { UseChatHelpers } from '@ai-sdk/react';
import type { Message } from 'ai';
import equal from 'fast-deep-equal';
import { RefreshCw } from 'lucide-react';
import { memo, type RefObject } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';
import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export function PureMessageActions({
  chatId,
  message,
  setMessages,
  vote,
  isLoading,
  enableFeedback,
  reload,
  messageRef,
}: {
  chatId: string;
  message: Message;
  setMessages: UseChatHelpers['setMessages'];
  vote: Vote | undefined;
  isLoading: boolean;
  enableFeedback: boolean;
  reload: UseChatHelpers['reload'];
  messageRef: RefObject<HTMLDivElement>;
}) {
  const { mutate } = useSWRConfig();
  const [_, copyToClipboard] = useCopyToClipboard();
  const viewConfig = useViewConfig();

  if (isLoading) return null;
  if (message.role === 'user') return null;

  async function richCopyToClipboard(
    messageHtml: string,
    messageContent: string,
  ) {
    const clipboardItem = new ClipboardItem({
      'text/plain': new Blob([messageContent], {
        type: 'text/plain',
      }),
      'text/html': new Blob([messageHtml], {
        type: 'text/html',
      }),
    });
    await navigator.clipboard.write([clipboardItem]);
  }

  const metadataAnnotations = getMessageAnnotationsByType(
    message.annotations,
    MessageAnnotationType.Metadata,
  );

  let traceId = '';
  if (metadataAnnotations.length >= 1) {
    console.info(metadataAnnotations);
    traceId = metadataAnnotations[0].metadata.trace_id;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="px-2 py-1 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                const textContent = message.parts
                  ?.filter((part) => part.type === 'text')
                  .map((part) => part.text)
                  .join('\n')
                  .trim();

                if (!textContent) {
                  toast.error("There's no text to copy!");
                  return;
                }

                if (messageRef.current) {
                  try {
                    const htmlContent = messageRef.current.innerHTML;
                    await richCopyToClipboard(htmlContent, textContent);
                  } catch (error) {
                    console.error('Failed to copy to clipboard:', error);
                    toast.error('Failed to copy to clipboard');
                  }
                } else {
                  await copyToClipboard(textContent);
                }
                toast.success('Copied to clipboard');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="px-2 py-1 h-fit text-muted-foreground"
              variant="outline"
              onClick={async () => {
                if (!viewConfig.isIframe) {
                  await deleteTrailingMessages({
                    id: message.id,
                  });
                }

                setMessages((messages) => {
                  const index = messages.findIndex((m) => m.id === message.id);
                  if (index !== -1) {
                    return [...messages.slice(0, index)];
                  }
                  return messages;
                });

                reload();
              }}
            >
              <RefreshCw />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Retry</TooltipContent>
        </Tooltip>

        {enableFeedback && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-upvote"
                  className="px-2 py-1 h-fit text-muted-foreground !pointer-events-auto"
                  disabled={vote?.isUpvoted}
                  variant="outline"
                  onClick={async () => {
                    const upvote = fetch('/api/vote', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        chatId,
                        messageId: message.id,
                        traceId: traceId,
                        type: 'up',
                      }),
                    });

                    toast.promise(upvote, {
                      loading: 'Upvoting Response...',
                      success: () => {
                        mutate<Array<Vote>>(
                          '/api/vote?chatId=${chatId}',
                          (currentVotes) => {
                            if (!currentVotes) return [];

                            const votesWithoutCurrent = currentVotes.filter(
                              (vote) => vote.messageId !== message.id,
                            );

                            return [
                              ...votesWithoutCurrent,
                              {
                                chatId,
                                messageId: message.id,
                                traceId: traceId,
                                isUpvoted: true,
                              },
                            ];
                          },
                          { revalidate: false },
                        );

                        return 'Upvoted Response!';
                      },
                      error: 'Failed to upvote response.',
                    });
                  }}
                >
                  <ThumbUpIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Upvote Response</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-testid="message-downvote"
                  className="px-2 py-1 h-fit text-muted-foreground !pointer-events-auto"
                  variant="outline"
                  disabled={vote && !vote.isUpvoted}
                  onClick={async () => {
                    const downvote = fetch('/api/vote', {
                      method: 'PATCH',
                      body: JSON.stringify({
                        chatId,
                        messageId: message.id,
                        traceId: traceId,
                        type: 'down',
                      }),
                    });

                    toast.promise(downvote, {
                      loading: 'Downvoting Response...',
                      success: () => {
                        mutate<Array<Vote>>(
                          '/api/vote?chatId=${chatId}',
                          (currentVotes) => {
                            if (!currentVotes) return [];

                            const votesWithoutCurrent = currentVotes.filter(
                              (vote) => vote.messageId !== message.id,
                            );

                            return [
                              ...votesWithoutCurrent,
                              {
                                chatId,
                                messageId: message.id,
                                traceId: traceId,
                                isUpvoted: false,
                              },
                            ];
                          },
                          { revalidate: false },
                        );

                        return 'Downvoted Response!';
                      },
                      error: 'Failed to downvote response.',
                    });
                  }}
                >
                  <ThumbDownIcon />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Downvote Response</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (!equal(prevProps.message, nextProps.message)) return false;

    return true;
  },
);
