export type ToolStatus = 'call' | 'partial-call' | 'result';

export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  args: unknown;
  state: ToolStatus;
  result?: unknown;
}
