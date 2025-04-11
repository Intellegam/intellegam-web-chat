'use client';

import { AnnotationType, getAnnotationsByType } from '@/lib/types/annotations';
import type {
  SearchData,
  SearchToolInvocation,
  SearchType,
} from '@/lib/types/search';
import type { JSONValue } from 'ai';
import { useEffect, useState } from 'react';
import { SearchEntry } from './search-entry';

interface SearchToolComponentProps {
  toolInvocation: SearchToolInvocation;
  annotations?: JSONValue[];
}

export function SearchToolComponent({
  toolInvocation,
  annotations,
}: SearchToolComponentProps) {
  const [searchData, setSearchData] = useState<SearchData | null>(null);

  const getSearchType = (type: string) => {
    switch (type) {
      case 'webSearch':
        return 'web';
      case 'databaseSearch':
        return 'database';
      default:
        return 'general';
    }
  };

  useEffect(() => {
    if (!toolInvocation.args) return;
    if (!annotations) return;
    let type: SearchType = 'general';

    const toolCallMetadata = getAnnotationsByType(
      annotations,
      AnnotationType.ToolCallMeta,
    ).find((a) => a.toolCallId === toolInvocation.toolCallId);

    const sources = getAnnotationsByType(
      annotations,
      AnnotationType.Source,
    ).find((a) => a.toolCallId === toolInvocation.toolCallId);

    if (toolCallMetadata) {
      type = getSearchType(toolCallMetadata.widgetName);
    }

    const newSearchData: SearchData = {
      toolCallId: toolInvocation.toolCallId,
      query: toolInvocation.args.query,
      type: type,
      status: toolInvocation.state,
      results: sources?.sources,
    };

    setSearchData(newSearchData);
  }, [toolInvocation, annotations]);

  if (!searchData) {
    return null;
  }

  return <SearchEntry searchData={searchData} />;
}
