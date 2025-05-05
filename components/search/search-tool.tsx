'use client';

import {
  type SearchToolViewMessageAnnotation,
  type SourcesMessageAnnotation,
  ToolViewId,
} from '@/lib/types/annotations';
import type { ToolState } from '@/lib/types/tool';
import { AnimatePresence, motion } from 'framer-motion';
import { DatabaseIcon, GlobeIcon, SearchIcon } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import ShinyText from '../ui/shiny-text';
import { SearchResultItem } from './search-result-item';

interface SearchToolComponentProps {
  toolCallId: string;
  state: ToolState;
  searchAnnotation: SearchToolViewMessageAnnotation;
  sourcesAnnotation?: SourcesMessageAnnotation[];
}

export function SearchToolComponent({
  toolCallId,
  state,
  searchAnnotation,
  sourcesAnnotation,
}: SearchToolComponentProps) {
  const sources = sourcesAnnotation
    ? sourcesAnnotation.flatMap((sa) => sa.sources)
    : [];

  const getSearchTypeIcon = (type: ToolViewId) => {
    switch (type) {
      case ToolViewId.WebSearch:
        return <GlobeIcon className="size-3.5" />;
      case ToolViewId.DatabaseSearch:
        return <DatabaseIcon className="size-3.5" />;
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

  function getSearchText(type: ToolViewId) {
    switch (type) {
      case ToolViewId.WebSearch:
        return 'Searching Web';
      case ToolViewId.DatabaseSearch:
        return 'Searching Database';
      default:
        return 'Finding Information';
    }
  }

  return (
    <div className="flex items-start gap-2">
      <div className="mt-[0.4rem] text-muted-foreground">
        {getSearchTypeIcon(searchAnnotation.toolViewId)}
      </div>

      <div className="flex-1">
        <AnimatePresence mode="wait">
          {state === 'call' ? (
            <motion.div
              key="searching"
              {...textAnimationProps}
              className="py-1 text-muted-foreground text-sm"
            >
              <ShinyText
                speed={2}
                text={getSearchText(searchAnnotation.toolViewId)}
              />
            </motion.div>
          ) : state === 'result' && sources.length === 0 ? (
            <motion.div
              key="no-results"
              {...textAnimationProps}
              className="flex-1"
            >
              <div className="flex items-center py-1 cursor-default">
                <span className="text-muted-foreground text-sm">0 sources</span>
              </div>
              {state === 'result' && (
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
                <AccordionItem value="results" className="border-none w-full">
                  <AccordionTrigger className="flex justify-start items-center gap-2 p-1 hover:no-underline">
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
                          <p className="text-sm truncate">
                            {searchAnnotation.toolViewData?.query}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-y-1 max-h-44 overflow-scroll">
                        {sources.map((result, index) => (
                          <SearchResultItem
                            key={`${toolCallId}-${result.url}-${index}`}
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
