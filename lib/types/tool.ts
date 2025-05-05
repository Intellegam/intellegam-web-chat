export type ToolState = 'call' | 'partial-call' | 'result';

export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  args: unknown;
  state: ToolState;
  result?: unknown;
}
