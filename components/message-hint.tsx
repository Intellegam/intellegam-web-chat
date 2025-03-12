import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function MessageDisclaimer() {
  const router = useRouter();

  function handleNewChat(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    router.refresh();
  }

  return (
    <div className="flex justify-between items-center bg-neutral-200 dark:bg-neutral-900  border border-b-0 border-input dark:border-zinc-700  rounded-t-md w-[90%] sm:w-[96%] px-2 py-1 m-auto">
      <p className="text-xs">Tip: Shorter chats help the assistant to focus.</p>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={handleNewChat}
      >
        New Chat
      </Button>
    </div>
  );
}
