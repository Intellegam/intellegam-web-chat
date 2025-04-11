'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import type { SearchData, SearchType } from '@/lib/types/search';
import { DatabaseIcon, GlobeIcon, SearchIcon } from 'lucide-react';
import { SearchResultItem } from './search-result-item';
import ShinyText from '../ui/shiny-text';
import { AnimatePresence, motion } from 'framer-motion';

interface SearchEntryProps {
  searchData: SearchData;
}

export function SearchEntry({ searchData }: SearchEntryProps) {
  const hasResults = searchData.results;
  const sources = searchData.results ?? [];

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

  // Text animation props for consistency
  const textAnimationProps = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 },
  };

  return (
    <div className="flex items-start gap-2">
      <div className="mt-[0.4rem] text-muted-foreground">
        {getSearchTypeIcon(searchData.type)}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {searchData.status === 'call' ? (
            <motion.div
              key="searching"
              {...textAnimationProps}
              className="py-1 text-muted-foreground text-sm"
            >
              <ShinyText
                speed={2}
                text={`Searching ${searchData.type ?? ''}...`}
              />
            </motion.div>
          ) : !hasResults || sources.length === 0 ? (
            <motion.div
              key="no-results"
              {...textAnimationProps}
              className="flex-1"
            >
              <div className="flex items-center py-1 cursor-default">
                <span className="text-muted-foreground text-sm">0 sources</span>
              </div>
              {searchData.status === 'result' && (
                <div className="ml-3 text-muted-foreground text-sm">
                  No results found.
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="results"
              {...textAnimationProps}
              className="flex-1"
            >
              <Accordion type="single" collapsible className="border-none">
                <AccordionItem value="results" className="border-none w-fit">
                  <AccordionTrigger className="flex justify-start items-center gap-2 px-0 py-1 hover:no-underline">
                    <div className="flex items-center">
                      <span className="text-muted-foreground text-sm">
                        {sources.length}{' '}
                        {sources.length === 1 ? 'source' : 'sources'}
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
                        {sources.map((result) => (
                          <SearchResultItem
                            key={`${searchData.toolCallId}-${result.url}`}
                            result={result}
                          />
                        ))}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
