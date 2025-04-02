'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { SearchData, SearchType } from '@/lib/types/search';
import { DatabaseIcon, GlobeIcon, LoaderIcon, SearchIcon } from 'lucide-react';
import { SearchResultItem } from './search-result-item';
import ShinyText from '../ui/shiny-text';

interface SearchEntryProps {
  searchData: SearchData;
}

export function SearchEntry({ searchData }: SearchEntryProps) {
  const hasResults = searchData.results;

  const getSearchTypeIcon = (type: SearchType) => {
    switch (type) {
      case 'web':
        return <GlobeIcon className="size-3.5" />;
      case 'database':
        return <DatabaseIcon className="size-3.5" />;
      case 'general':
      default:
        return <SearchIcon className="size-3.5" />;
    }
  };

  if (searchData.status === 'searching') {
    return (
      <div className="flex items-center gap-2 py-1 text-muted-foreground text-sm">
        <LoaderIcon className="size-3.5 animate-pulse" />
        <ShinyText text={`Searching ${searchData.type ?? ''}...`} />
      </div>
    );
  }

  if (!hasResults || searchData.results.length === 0) {
    return (
      <div className="my-1.5">
        <div className="flex items-center gap-2 py-1 cursor-default">
          <div className="flex items-center gap-1.5">
            <div className="text-muted-foreground">
              {getSearchTypeIcon(searchData.type)}
            </div>
            <span className="text-muted-foreground text-sm">0 sources</span>
          </div>
        </div>
        {searchData.status === 'received' && (
          <div className="ml-5 text-muted-foreground text-sm">
            No results found.
          </div>
        )}
      </div>
    );
  }

  return (
    <Accordion type="single" collapsible className="border-none">
      <AccordionItem value="results" className="border-none w-fit">
        <AccordionTrigger className="flex justify-start items-center gap-2 px-0 py-1 hover:no-underline">
          <div className="flex items-center gap-1.5">
            <div className="text-muted-foreground">
              {getSearchTypeIcon(searchData.type)}
            </div>
            <span className="text-muted-foreground text-sm">
              {searchData.results.length}{' '}
              {searchData.results.length === 1 ? 'source' : 'sources'}
            </span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-0 pt-1 pb-2">
          <div className="mt-1 mb-2 border rounded-lg overflow-hidden">
            <div className="bg-muted/20 p-2 border-b">
              <div className="flex items-center gap-1.5">
                <SearchIcon className="size-3.5 text-muted-foreground" />
                <p className="text-sm truncate">{searchData.query}</p>
              </div>
            </div>
            <div className="flex flex-col gap-y-1 max-h-44 overflow-scroll">
              {searchData.results.map((result) => (
                <SearchResultItem
                  key={`${result.tool_call_id}-${result.url}`}
                  result={result}
                />
              ))}
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
