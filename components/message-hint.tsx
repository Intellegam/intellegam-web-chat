import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function MessageDisclaimer() {
  const router = useRouter();

  function handleNewChat(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    router.refresh();
  }

  return (
    <div className="flex align-center justify-between bg-slate-500 rounded-t-md w-[90%] sm:w-[95%] px-2 py-1 m-auto">
      <div className="text-sm">
        Tip: Shorter chats help the assistant to focus.
      </div>
      <Button variant="ghost" onClick={handleNewChat}>
        New Chat
      </Button>
    </div>
  );
}
