'use client';

import { motion } from 'framer-motion';
import { Button } from './ui/button';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { memo } from 'react';
import { useChatSettingsContext } from '@/contexts/chat-config-context';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
}

function PureSuggestedActions({ chatId, append }: SuggestedActionsProps) {
  let suggestedActions: { title: string; label: string; action: string }[] = [];
  const { chatConfig } = useChatSettingsContext();
  if (chatConfig.startPrompts) {
    suggestedActions = chatConfig.startPrompts
      .sort((a, b) => b.length - a.length)
      .map((p) => ({ title: p, label: p, action: p }));
  }

  return (
    <div
      data-testid="suggested-actions"
      className="flex flex-row flex-wrap gap-1 w-full"
    >
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
            className="sm:flex-col flex-1 justify-start items-start gap-1 px-3 py-2 border rounded-xl w-full h-auto text-sm text-left"
          >
            <span className="font-medium text-muted-foreground text-xs md:text-sm text-wrap">
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
