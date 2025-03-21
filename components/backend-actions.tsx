import type { ActionItem } from '@/lib/types/custom-data';
import { cn } from '@/lib/utils';
import type { JSONValue } from 'ai';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import ShinyText from './ui/shiny-text';
import { Skeleton } from './ui/skeleton';

function BackendAction({ action }: { action: ActionItem }) {
  return <p>{action.action}</p>;
}

export default function BackendActions({
  annotation,
  isActive,
  result,
}: {
  annotation?: JSONValue;
  isActive: boolean;
  result?: string;
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

  const action = annotation
    ? (safelyParseBackendAction(annotation) ?? { action: 'Searching' })
    : { action: 'Searching' };

  return (
    <>
      {action && (
        <Accordion type="single" collapsible>
          <AccordionItem value="search" className="border-none">
            <AccordionTrigger
              className={cn(
                'dark:bg-neutral-900 px-3 py-1 border border-neutral-200 dark:border-neutral-800 rounded-lg w-full hover:no-underline',
                '[&[data-state=open]]:rounded-b-none',
              )}
            >
              <span>
                <Search size={18} />
              </span>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="py-1 font-normal text-base truncate"
              >
                {isActive ? (
                  <ShinyText text={action.action} speed={5} />
                ) : (
                  action.action
                )}
              </motion.div>
            </AccordionTrigger>
            <AccordionContent className="flex items-center gap-x-2 dark:bg-neutral-900 px-3 py-2 border dark:border-neutral-800 border-t-0 rounded-b-lg w-full max-w-full overflow-x-auto">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="rounded-lg w-28 h-24 shrink-0"
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    </>
  );
}
