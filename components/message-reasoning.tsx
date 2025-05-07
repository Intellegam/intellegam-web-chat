'use client';

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import { ChevronDownIcon, LoaderIcon } from './icons';
import { Markdown } from './markdown';

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
      className={` text-zinc-600 dark:text-zinc-200 bg-secondary  ${!isOpen ? 'hover:bg-zinc-700 transition-colors' : ''} px-3 py-2 border dark:border-zinc-700 rounded-xl w-full`}
    >
      <div className="flex flex-row items-center gap-2">
        <CollapsibleTrigger
          data-testid="message-reasoning-toggle"
          className="flex justify-between items-center gap-x-2 w-full cursor-pointer"
        >
          <div className="flex items-center">
            {isOpen ? (
              <p>Reasoning</p>
            ) : (
              <p className="line-clamp-1">{reasoning.split(':')[0]}</p>
            )}

            {isLoading && (
              <div className="ml-2 w-fit animate-spin">
                <LoaderIcon />
              </div>
            )}
          </div>
          <span
            className={`${isOpen ? 'rotate-180' : ''} transition-transform`}
          >
            <ChevronDownIcon />
          </span>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent
        data-testid="message-reasoning"
        // className="mt-2 max-h-64 overflow-y-auto text-sm"
      >
        <Markdown>{reasoning}</Markdown>
      </CollapsibleContent>
    </Collapsible>
  );
}
