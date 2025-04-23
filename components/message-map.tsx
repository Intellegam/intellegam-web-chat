import type { UIMessage } from 'ai';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function MessageMap({
  messages,
  scrollContainerId = 'messages-container',
}: { messages: Array<UIMessage>; scrollContainerId?: string }) {
  const [visibleMessageId, setVisibleMessageId] = useState<string>();
  const visibleMessagesRef = useRef<Set<string>>(new Set());
  const userMessages = messages.filter((message) => message.role === 'user');

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const messageId = entry.target.id;
        if (entry.isIntersecting) {
          visibleMessagesRef.current.add(messageId);
        } else {
          visibleMessagesRef.current.delete(messageId);
        }
      });
      const messageIds = userMessages.map((m) => m.id);
      const lastVisible = Array.from(visibleMessagesRef.current.values()).sort(
        (a, b) => messageIds.indexOf(b) - messageIds.indexOf(a),
      )[0];

      if (!lastVisible) {
        return; // If nothing is visible, weird
      }
      setVisibleMessageId(lastVisible);
    },
    [userMessages],
  );

  useEffect(() => {
    const scrollContainer = document.getElementById(scrollContainerId);

    if (!scrollContainer) {
      console.error(
        `Could not find scrollable container with ID: ${scrollContainerId}`,
      );
      return;
    }

    // Create the observer with the correct scrollable container as root
    const observer = new IntersectionObserver(handleIntersection, {
      root: scrollContainer,
      rootMargin: `${scrollContainer.clientHeight}px 0px -33% 0px`,
      threshold: 0,
    });
    userMessages.forEach((message) => {
      const element = document.getElementById(message.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [userMessages, handleIntersection, scrollContainerId]);

  function onClickScroll(messageId: string) {
    setVisibleMessageId(messageId);
    document.getElementById(messageId)?.scrollIntoView({ behavior: 'smooth' });
  }

  if (messages.length <= 2) {
    console.log(messages.length);
    return null;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-col justify-center items-center h-full">
        {userMessages.map((message, _) => {
          const isVisible = message.id === visibleMessageId;

          return (
            <Tooltip key={message.id}>
              <TooltipTrigger asChild>
                <button type="button" onClick={() => onClickScroll(message.id)}>
                  <div
                    className={`rounded w-1 transition-all mb-2 ${isVisible ? 'h-6 bg-primary/90' : 'h-4 bg-primary/70'}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <ul className="w-64">
                  <li className="mb-1">
                    <p
                      className={`w-full max-w-full hover:text-primary text-primary text-sm text-left line-clamp-2 transition-all`}
                    >
                      {message.content}
                    </p>
                  </li>
                </ul>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
