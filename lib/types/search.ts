import type { SourcesAnnotation } from './annotations';
import type { ToolInvocation, ToolStatus } from './tool';

export type SearchType = 'web' | 'database' | 'general';

export interface SearchData {
  toolCallId: string;
  query: string;
  type: SearchType;
  status: ToolStatus;
  results?: SourcesAnnotation;
}

export interface SearchToolInvocation extends ToolInvocation {
  toolName: 'search';
  args: {
    query: string;
  };
  result?: string;
}
