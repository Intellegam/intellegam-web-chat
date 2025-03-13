'use client';

import { useChatSettingsContext } from '@/contexts/chat-config-context';
import type { ChatRequestOptions, CreateMessage, Message } from 'ai';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { Button } from './ui/button';
import { useViewConfig } from '@/contexts/view-config-context';

interface SuggestedActionsProps {
  chatId: string;
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  showStartPrompts: boolean;
  showFollowUpPrompts: boolean;
}

function PureSuggestedActions({
  chatId,
  append,
  showStartPrompts,
  showFollowUpPrompts,
}: SuggestedActionsProps) {
  const { chatConfig, adminChatConfig } = useChatSettingsContext();
  const viewConfig = useViewConfig();
  let suggestedActions: { title: string; label: string; action: string }[] = [];

  if (showStartPrompts) {
    suggestedActions = chatConfig.startPrompts
      .sort((a, b) => b.length - a.length)
      .map((p) => ({ title: p, label: p, action: p }));
  }
  if (showFollowUpPrompts) {
    suggestedActions = adminChatConfig.followUpPrompts
      .sort((a, b) => b.length - a.length)
      .map((p) => ({ title: p, label: p, action: p }));
  }

  return (
    <div className="flex w-full flex-row flex-wrap gap-1">
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
              if (!viewConfig.isIframe) {
                window.history.replaceState({}, '', `/chat/${chatId}`);
              }

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
