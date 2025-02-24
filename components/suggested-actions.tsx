'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  startPrompts?: string[];
}

function PureSuggestedActions({
  chatId,
  append,
  startPrompts,
}: SuggestedActionsProps) {
  let suggestedActions: { title: string; label: string; action: string }[] = [];
  if (startPrompts) {
    suggestedActions = startPrompts
      .sort((a, b) => b.length - a.length)
      .map((p) => ({ title: p, label: p, action: p }));
  }

  return (
    <div className='flex w-full flex-row flex-wrap gap-1'>
      {suggestedActions.map((suggestedAction, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.05 * index }}
          key={`suggested-action-${suggestedAction.title}-${index}`}
          className={index > 1 ? 'hidden sm:block' : 'block'}
        >
          <Button
            variant="ghost"
            onClick={async () => {
              //TODO: check for iframe here
              // window.history.replaceState({}, '', `/chat/${chatId}`);

              append({
                role: 'user',
                content: suggestedAction.action,
              });
            }}
            className="h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border px-3 py-2 text-left text-sm sm:flex-col"
          >
            <span className="text-wrap font-medium text-muted-foreground text-xs md:text-sm">
              {suggestedAction.title}
            </span>
            {/* <span className="text-muted-foreground">
              {suggestedAction.label}
            </span> */}
          </Button>
        </motion.div>
      ))}
    </div>
  );
}

export const SuggestedActions = memo(PureSuggestedActions, () => true);
