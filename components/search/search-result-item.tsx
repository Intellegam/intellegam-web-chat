'use client';

import type { Source } from '@/lib/types/search';

interface SearchResultItemProps {
  result: Source;
}

export function SearchResultItem({ result }: SearchResultItemProps) {
  console.log(result);

  // Extract domain from URL if available
  const domain = result.url
    ? new URL(result.url).hostname.replace('www.', '')
    : '';

  return (
    <a
      href={result.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 hover:bg-muted/20 p-3 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-1">
          {result.headings?.at(0)}
        </h4>
        <p className="mt-0.5 text-muted-foreground text-xs line-clamp-2">
          {domain}
        </p>
      </div>
    </a>
  );
}
