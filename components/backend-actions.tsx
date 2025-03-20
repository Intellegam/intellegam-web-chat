import type { ActionItem } from '@/lib/types/custom-data';
import type { JSONValue } from 'ai';
import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { cn } from '@/lib/utils';
import { CornerDownRight, Search } from 'lucide-react';
import ShinyText from './ui/shiny-text';

function BackendAction({ action }: { action: ActionItem }) {
  return <p>{action.action}</p>;
}

export default function BackendActions({
  annotations,
  messageId,
  isActive,
}: {
  annotations?: JSONValue[];
  messageId: string;
  isActive: boolean;
}) {
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

  return (
    <>
      {actions && (
        <Accordion type="single" collapsible>
          <AccordionItem value="search" className="border-none">
            <AccordionTrigger
              className={cn(
                'dark:bg-neutral-900 px-2 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg w-full hover:no-underline',
                '[&[data-state=open]]:rounded-b-none',
              )}
            >
              <span>
                <Search size={18} />
              </span>
              <motion.div
                key={actions.at(-1)?.action}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="py-1 font-normal text-base truncate"
              >
                {isActive ? (
                  <ShinyText text={actions.at(-1)?.action || ''} speed={5} />
                ) : (
                  actions.at(-1)?.action
                )}
              </motion.div>
            </AccordionTrigger>
            <AccordionContent className="dark:bg-neutral-900 px-2 py-1 border dark:border-neutral-800 border-t-0 rounded-b-lg">
              <ul>
                {actions.map((action, actionIndex) => (
                  <li
                    key={`action-${messageId}-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      actionIndex
                    }`}
                    className="flex items-center gap-x-1 my-1"
                  >
                    <CornerDownRight size={14} />
                    <BackendAction action={action} />
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
