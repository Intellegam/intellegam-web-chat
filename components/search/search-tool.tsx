'use client';

import { AnnotationType, WidgetId } from '@/lib/types/annotations';
import type { SearchData, SearchType } from '@/lib/types/search';
import type { JSONValue, ToolInvocation } from 'ai';
import { useEffect, useState } from 'react';
import { SearchEntry } from './search-entry';
import {
  getAnnotationsByTypeAndToolId,
  getSearchWidgetDataByToolCallId,
} from '@/lib/utils/annotationUtils';

interface SearchToolComponentProps {
  toolInvocation: ToolInvocation;
  annotations?: JSONValue[];
}

export function SearchToolComponent({
  toolInvocation,
  annotations,
}: SearchToolComponentProps) {
  const [searchData, setSearchData] = useState<SearchData | null>(null);

  const getSearchType = (widgetId: WidgetId) => {
    switch (widgetId) {
      case WidgetId.WebSearch:
        return 'web';
      case WidgetId.DatabaseSearch:
        return 'database';
      default:
        return 'general';
    }
  };

  useEffect(() => {
    if (!toolInvocation.args) return;
    if (!annotations) return;
    let type: SearchType = 'general';

    const widgetDataAnnotation = getSearchWidgetDataByToolCallId(
      annotations,
      toolInvocation.toolCallId,
    );

    const sourcesAnnotation = getAnnotationsByTypeAndToolId(
      annotations,
      AnnotationType.Sources,
      toolInvocation.toolCallId,
    )[0];

    if (widgetDataAnnotation) {
      type = getSearchType(widgetDataAnnotation.widgetId);
    }

    const newSearchData: SearchData = {
      toolCallId: toolInvocation.toolCallId,
      query: widgetDataAnnotation?.widgetData?.query ?? '',
      type: type,
      status: toolInvocation.state,
      results: sourcesAnnotation?.sources ?? [],
    };

    setSearchData(newSearchData);
  }, [toolInvocation, annotations]);

  if (!searchData) {
    return null;
  }

  return <SearchEntry searchData={searchData} />;
}
