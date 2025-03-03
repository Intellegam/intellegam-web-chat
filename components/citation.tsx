import Link from 'next/link';
import type { ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from './ui/hover-card';

export default function Citation({
  children,
  href,
}: { children: ReactNode; href?: string }) {
  const textContent = children?.toString().match(/\d+/)?.[0] || '';

  return (
    <sup>
      <HoverCard>
        <HoverCardTrigger asChild>
          <Link
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-xs text-primary py-0.5 px-2 m-0 bg-neutral-200 dark:bg-neutral-700 rounded-full no-underline font-medium"
            href={href || ''}
          >
            {textContent}
          </Link>
        </HoverCardTrigger>
        <HoverCardContent
          side="top"
          align="start"
          className="w-64 p-1 text-sm shadow-lg text-ellipsis overflow-x-auto"
        >
          {href}
        </HoverCardContent>
      </HoverCard>
    </sup>
  );
}
