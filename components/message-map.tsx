import type { UIMessage } from 'ai';
import {
  useEffect,
  useState,
  useRef,
  useCallback,
  type RefObject,
} from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

export default function MessageMap({
  messages,
  scrollContainerRef,
}: {
  messages: Array<UIMessage>;
  scrollContainerRef: RefObject<HTMLDivElement>;
}) {
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
    if (!scrollContainerRef.current) return;

    // Create the observer with the correct scrollable container as root
    const observer = new IntersectionObserver(handleIntersection, {
      root: scrollContainerRef.current,
      rootMargin: `${scrollContainerRef.current.clientHeight}px 0px -33% 0px`,
      threshold: 0.0,
    });
    userMessages.forEach((message) => {
      const element = document.getElementById(message.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [userMessages, handleIntersection, scrollContainerRef]);

  function onClickScroll(messageId: string) {
    setVisibleMessageId(messageId);
    document.getElementById(messageId)?.scrollIntoView({ behavior: 'smooth' });
  }

  if (messages.length <= 2) {
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
                    className={`rounded w-1 transition-all mb-1.5 ${isVisible ? 'h-6 bg-primary/70' : 'h-4 bg-primary/50'}`}
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <ul className="w-48">
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
