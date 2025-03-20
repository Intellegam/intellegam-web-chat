import type { ActionItem } from '@/lib/types/custom-data';
import type { JSONValue } from 'ai';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { cn } from '@/lib/utils';

function BackendAction({ action }: { action: ActionItem }) {
  return <p>{action.action}</p>;
}

export default function BackendActions({
  annotations,
  isLoading,
  messageId,
}: { annotations?: JSONValue[]; isLoading: boolean; messageId: string }) {
  function safelyParseBackendAction(data: JSONValue): ActionItem | null {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
      return null;
    }

    // Try to destructure the action property
    const { action } = data;

    // Validate the action property is a string
    if (typeof action !== 'string') {
      return null;
    }

    // Return the destructured and validated action
    return { action };
  }

  const actions = annotations
    ? annotations
        .map((a) => safelyParseBackendAction(a))
        .filter((a) => a !== null)
    : null;

  useEffect(() => {
    console.log(actions);
  });

  return (
    <>
      {actions && (
        <div className="w-full">
          <Accordion type="single" defaultValue="search" collapsible>
            <AccordionItem value="search" className="border-none">
              <AccordionTrigger
                className={cn(
                  'dark:bg-neutral-900 px-2 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg w-full hover:no-underline',
                  '[&[data-state=open]]:rounded-b-none',
                )}
              >
                <motion.p
                  key={actions.at(-1)?.action}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className={cn('py-1 font-normal text-base truncate', {
                    'animate-pulse': isLoading,
                  })}
                >
                  {actions.at(-1)?.action}
                </motion.p>
              </AccordionTrigger>
              <AccordionContent className="dark:bg-neutral-900 px-2 py-1 border dark:border-neutral-800 border-t-0 rounded-b-lg">
                <ul>
                  {actions.map((action, actionIndex) => (
                    <li
                      key={`action-${messageId}-${
                        // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                        actionIndex
                      }`}
                    >
                      <BackendAction action={action} />
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </>
  );
}
