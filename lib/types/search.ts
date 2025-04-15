import type { Source } from './annotations';
import type { ToolStatus } from './tool';

export type SearchType = 'web' | 'database' | 'general';

export interface SearchData {
  toolCallId: string;
  query: string;
  type: SearchType;
  status: ToolStatus;
  results?: Source[];
}
