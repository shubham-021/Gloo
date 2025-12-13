import { z } from 'zod';

export interface ToolDefinition<TInput = any, TOutput = any> {
    name: string;
    description: string;
    category: 'filesystem' | 'web' | 'system' | 'search' | 'analysis';

    inputSchema: z.ZodType<TInput>;

    execute: (input: TInput, context: ToolContext) => Promise<TOutput>;

    needsApproval?: boolean | ((input: TInput) => boolean);
}
export interface ToolContext {
    cwd: string;
    abortSignal?: AbortSignal;
}

export type ToolSet = Record<string, ToolDefinition>;