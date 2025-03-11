import { motion } from 'framer-motion';

function BackendAction({ action }: { action: string }) {
  return (
    <motion.div
      className="text-center ml-10 text-sm text-muted-foreground"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {action}
    </motion.div>
  );
}

export default function BackendActions({
  actions,
  messageId,
}: { actions: string[]; messageId: string }) {
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
