'use client';

import type {
  SearchData,
  SearchToolInvocation,
  SearchType,
  Source,
} from '@/lib/types/search';
import type { JSONValue, SourceUIPart } from 'ai';
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

  useEffect(() => {
    if (!toolInvocation.args) return;
    if (!annotations) return;
    let type: SearchType = 'general';
    // TODO: a general function to parse/typeguard the annotations
    const toolCallMetadata = annotations
      .filter(
        (a): a is { toolCallId: string; widget_name: string } =>
          typeof a === 'object' &&
          a !== null &&
          !Array.isArray(a) &&
          'toolCallId' in a &&
          'widget_name' in a,
      )
      .find((m) => m.toolCallId === toolInvocation.toolCallId);

    const sources = annotations.filter(
      (a) =>
        typeof a === 'object' &&
        a !== null &&
        !Array.isArray(a) &&
        'text' in a &&
        'type' in a &&
        'toolCallId' in a,
    );
    console.log(sources);

    // .filter(
    //   (m) =>
    //     m !== null &&
    //     m !== undefined &&
    //     (m as any).toolCallId === toolInvocation.toolCallId,
    // );

    if (toolCallMetadata) {
      type = toolCallMetadata.widget_name === 'webSearch' ? 'web' : 'general';
    }

    const newSearchData: SearchData = {
      id: toolInvocation.toolCallId,
      query: toolInvocation.args.query,
      type: type,
      status: toolInvocation.state === 'call' ? 'searching' : 'received',
      results: sources as unknown as Source[],
      error: '',
      timestamp: Date.now(),
    };

    setSearchData(newSearchData);
  }, [toolInvocation, annotations]);

  if (!searchData) {
    return null;
  }

  return <SearchEntry searchData={searchData} />;
}
