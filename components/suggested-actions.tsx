'use client';

import { useViewConfig } from '@/contexts/view-config-context';
import type { UseChatHelpers } from '@ai-sdk/react';
import { motion } from 'framer-motion';
import { memo } from 'react';
import { Button } from './ui/button';
import equal from 'fast-deep-equal';

interface SuggestedActionsProps {
  chatId: string;
  append: UseChatHelpers['append'];
  searchWeb: boolean;
  actions: string[];
}

function PureSuggestedActions({
  chatId,
  append,
  searchWeb,
  actions,
}: SuggestedActionsProps) {
  const viewConfig = useViewConfig();
  //TODO: Either change the data model of the suggested actions or the data model of the startPrompts/FollowUpPrompts -Meris
  // This conversion is unnecessary and just causes confusion

  // This sorts the prompts from shortest to longest for a more cohesive look in the ui
  // and transforms them into the suggestedActions format
  const suggestedActions: { title: string; label: string; action: string }[] =
    actions
      .sort((a, b) => a.length - b.length)
      .map((p) => ({ title: p, label: p, action: p }));

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
              if (!viewConfig.isIframe) {
                window.history.replaceState({}, '', `/chat/${chatId}`);
              }

              append(
                {
                  role: 'user',
                  content: suggestedAction.action,
                },
                { body: { enableWebSearch: searchWeb } },
              );
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

export const SuggestedActions = memo(
  PureSuggestedActions,
  (prevProps, nextProps) => {
    if (prevProps.searchWeb !== nextProps.searchWeb) {
      return false;
    }

    if (!equal(prevProps.actions, nextProps.actions)) {
      return false;
    }

    return true;
  },
);
