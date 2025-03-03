import Link from 'next/link';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';
import { HoverCardPortal } from '@radix-ui/react-hover-card';

export default function Citation({
  title,
  href,
}: { title: string; href?: string }) {
  return (
    <sup>
      <HoverCard openDelay={300} closeDelay={100}>
        <HoverCardTrigger asChild>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-xs text-primary py-0.5 px-2 m-0 bg-neutral-200 dark:bg-neutral-700 rounded-full no-underline font-medium"
            href={href || ''}
          >
            {title}
          </Link>
        </HoverCardTrigger>
        <HoverCardPortal>
          <HoverCardContent
            asChild
            side="top"
            align="start"
            className="w-64 p-1 text-sm shadow-lg text-ellipsis overflow-x-auto"
          >
            <p>{href}</p>
          </HoverCardContent>
        </HoverCardPortal>
      </HoverCard>
    </sup>
  );
}
