import { motion } from 'framer-motion';
import type { ActionItem } from '@/lib/types/custom-data';
import type { JSONValue } from 'ai';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './ui/accordion';
import { useEffect } from 'react';

function BackendAction({ action }: { action: ActionItem }) {
  return (
    <div>
      <p>{action.action}</p>
    </div>
  );
}

export default function BackendActions({
  annotations,
  messageId,
}: { annotations?: JSONValue[]; messageId: string }) {
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
        <div className="w-full max-w-2xl mx-auto">
          <Accordion type="single" collapsible>
            <AccordionItem value="search" className="border-none">
              <AccordionTrigger className="hover:no-underline border-b pb-1 w-full">
                <motion.p
                  // key={actions.at(-1)?.action}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="text-base font-normal pr-1 truncate "
                >
                  {actions.at(-1)?.action}
                </motion.p>
              </AccordionTrigger>
              <AccordionContent className="flex flex-col gap-y-2 py-1">
                {actions.map((action, actionIndex) => (
                  <BackendAction
                    key={`action-${messageId}-${
                      // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                      actionIndex
                    }`}
                    action={action}
                  />
                ))}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      )}
    </>
  );
}
