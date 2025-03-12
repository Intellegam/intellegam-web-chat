import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from './ui/button';

export default function ChatHint({
  assistantMessageCount,
}: { assistantMessageCount: number }) {
  const router = useRouter();
  const [showHint, setShowHint] = useState(false);
  const hintShowInterval = 8;

  useEffect(() => {
    if (
      assistantMessageCount > 0 &&
      assistantMessageCount % hintShowInterval === 0
    ) {
      setShowHint(true);
    }
  }, [assistantMessageCount]);

  function handleNewChat(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    router.refresh();
  }

  function handleClose(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setShowHint(false);
  }

  if (!showHint) return null;

  return (
    <motion.div
      className="flex justify-between items-center bg-neutral-200 dark:bg-neutral-900 border border-b-0 border-input dark:border-zinc-700 rounded-t-md w-[90%] sm:w-[96%] px-1 m-auto"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <p className="text-xs">Tip: Shorter chats help the assistant to focus.</p>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs hover:bg-transparent"
          onClick={handleNewChat}
        >
          New Chat
        </Button>
        <Button variant="ghost" className="size-7" onClick={handleClose}>
          <X size={16} />
        </Button>
      </div>
    </motion.div>
  );
}
