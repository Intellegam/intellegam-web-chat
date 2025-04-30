'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { Markdown } from './markdown';
import { useState } from 'react';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      data-testid="message-reasoning-container"
      className={` text-zinc-600 dark:text-zinc-300 bg-secondary ${!isOpen ? 'hover:bg-zinc-600' : ''} px-3 py-2 border dark:border-zinc-700 rounded-xl w-full transition-colors`}
    >
      <div className="flex flex-row items-center gap-2">
        <CollapsibleTrigger
          data-testid="message-reasoning-toggle"
          className="flex items-center gap-x-2 w-full cursor-pointer"
        >
          {isLoading ? (
            <>
              <div className="font-medium">Reasoning</div>
              <div className="animate-spin">
                <LoaderIcon />
              </div>
            </>
          ) : (
            <div className="font-medium">Reasoning</div>
          )}

          <span
            className={`${isOpen ? 'rotate-180' : ''} transition-transform`}
          >
            <ChevronDownIcon />
          </span>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent data-testid="message-reasoning" className="my-2">
        <Markdown>{reasoning}</Markdown>
      </CollapsibleContent>
    </Collapsible>
  );
}
