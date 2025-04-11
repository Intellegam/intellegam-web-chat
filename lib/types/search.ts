import type { ToolInvocation, ToolStatus } from './tool';

export interface SearchToolInvocation extends ToolInvocation {
  toolName: 'search';
  args: {
    query: string;
  };
  result?: string;
}

export type SearchType = 'web' | 'database' | 'general';

export interface SearchData {
  toolCallId: string;
  query: string;
  type: SearchType;
  status: ToolStatus;
  results?: Source[];
}

export interface Source {
  //type: string;
  text: string;
  headings?: string[];
  url?: string;
  file_reference?: string;
  position?: number;
}
