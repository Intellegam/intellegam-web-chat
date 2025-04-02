export type SearchType = 'web' | 'database' | 'general';

export type SearchStatus = 'searching' | 'received' | 'error';

export interface Source {
  type: string;
  text: string;
  headings?: string[];
  url?: string;
  file_reference?: string;
  position?: number;
  tool_call_id?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  url?: string;
  source?: string;
  relevanceScore?: number;
}

export interface SearchData {
  id: string;
  query: string;
  type: SearchType;
  status: SearchStatus;
  //results: SearchResult[];
  results: Source[];
  error?: string;
  timestamp: number;
}

export interface SearchToolInvocation extends ToolInvocation {
  toolName: 'search';
  args: {
    query: string;
    type: SearchType;
  };
  //result?: SearchResult[];
  result?: string;
}

interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  args: any;
  state: 'call' | 'result';
  result?: any;
}
