'use client';

import type { Source } from '@/lib/types/annotations';
import { FileIcon, GlobeIcon } from 'lucide-react';

interface SearchResultItemProps {
  result: Source;
}

export function SearchResultItem({ result }: SearchResultItemProps) {
  // Extract domain from URL if available
  const domain = result.url
    ? new URL(result.url).hostname.replace('www.', '')
    : '';
  const fileName = result.fileReference?.split('/').pop();
  const fileType = fileName?.split('.').pop();
  const page = result.url?.match(/page=(\d+)/)?.[1];
  const header = result.headings
    ?.at(result.headings.length - 1)
    ?.replaceAll('#', '');

  return (
    <a
      href={result.url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 hover:bg-muted/20 p-3 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          {result.fileReference ? (
            <FileIcon size={12} />
          ) : (
            <GlobeIcon size={12} />
          )}
          <p className="text-xs line-clamp-2">{fileName ?? domain}</p>
        </div>
        <h4 className="font-medium text-sm line-clamp-1">{header}</h4>
        <p className="mt-0.5 text-muted-foreground text-xs line-clamp-2">
          {result.fileReference ? `Page ${page}` : result.text}
        </p>
      </div>
    </a>
  );
}
