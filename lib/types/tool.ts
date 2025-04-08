export type ToolStatus = 'call' | 'result';

export interface ToolInvocation {
  toolName: string;
  toolCallId: string;
  args: any;
  state: ToolStatus;
  result?: any;
}
