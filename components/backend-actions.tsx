import { motion } from 'framer-motion';
import type { ActionItem } from '@/lib/types/custom-data';

function BackendAction({ action }: { action: ActionItem }) {
  return (
    <motion.div
      className="text-center ml-10 text-sm text-muted-foreground"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {action.action}
    </motion.div>
  );
}

export default function BackendActions({
  actions,
  messageId,
}: { actions: ActionItem[]; messageId: string }) {
  return (
    <>
      {actions.map((action, actionIndex) => (
        <BackendAction
          key={`action-${messageId}-${
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            actionIndex
          }`}
          action={action}
        />
      ))}
    </>
  );
}
