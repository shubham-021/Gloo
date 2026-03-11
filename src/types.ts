import { ChatProvider, ChatMessage, Providers } from './providers/index.js';
import z from "zod"

export const DEC_PROMPT_RESPONSE = z.object({
    build: z.boolean().describe("Whether the query is about building something or not")
})

export const LTMESSAGETYPE = z.object({
    found: z.boolean().describe('Did user describe any type of preference in their query?'),
    preference: z.string().describe('User preference extracted from this query. Use empty string if no preference found.')
});

export type Message_memory = { role: 'user' | 'assistant' | 'tool', content: string };

export type ToolsTypes = Array<OpenAITool | ClaudeTool | GeminiTool>;

export type ChatModels = ChatProvider;

export type Message = ChatMessage;

export type Config = {
    provider: Providers,
    model: string,
    api: string,
    search_api: string
} | undefined;


export interface ModelInfo {
    id: string;
    label: string;
    supportsThinking: boolean;
}

export const OpenAIModels: ModelInfo[] = [
    { id: 'gpt-5', label: 'gpt-5', supportsThinking: true },
    { id: 'gpt-4.1', label: 'gpt-4.1', supportsThinking: false },
    { id: 'gpt-4o', label: 'gpt-4o', supportsThinking: false },
    { id: 'gpt-4o-mini', label: 'gpt-4o-mini', supportsThinking: false },
    { id: 'o3', label: 'o3', supportsThinking: true },
    { id: 'o3-mini', label: 'o3-mini', supportsThinking: true },
    { id: 'o4-mini', label: 'o4-mini', supportsThinking: true },
];

export const GeminiModels: ModelInfo[] = [
    { id: 'gemini-2.5-pro', label: 'gemini-2.5-pro', supportsThinking: true },
    { id: 'gemini-2.5-flash', label: 'gemini-2.5-flash', supportsThinking: true },
    { id: 'gemini-2.0-flash', label: 'gemini-2.0-flash', supportsThinking: false },
    { id: 'gemini-1.5-pro', label: 'gemini-1.5-pro', supportsThinking: false },
    { id: 'gemini-1.5-flash', label: 'gemini-1.5-flash', supportsThinking: false },
];

export const ClaudeModels: ModelInfo[] = [
    { id: 'claude-sonnet-4-6', label: 'claude-sonnet-4.6', supportsThinking: true },
    { id: 'claude-opus-4-6', label: 'claude-opus-4.6', supportsThinking: true },
    { id: 'claude-haiku-4-5-20251001', label: 'claude-haiku-4.5', supportsThinking: false },
];

export const ProviderModels: Record<Providers, ModelInfo[]> = {
    [Providers.OpenAI]: OpenAIModels,
    [Providers.Claude]: ClaudeModels,
    [Providers.Gemini]: GeminiModels,
};

export function getModelsForProvider(provider: Providers): ModelInfo[] {
    return ProviderModels[provider];
}

export interface OpenAITool {
    type: "function",
    function: {
        name: string,
        description: string,
        parameters: {
            type: "object",
            properties: Record<string, any>,
            required: string[]
        }
    }
};

export interface GeminiTool {
    function_declarations: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required: string[];
        };
    }[];
}

export interface ClaudeTool {
    name: string;
    description: string;
    input_schema: {
        type: "object";
        properties: Record<string, any>;
        required: string[];
    };
}

export interface ToolMap {
    [Providers.OpenAI]: OpenAITool;
    [Providers.Gemini]: GeminiTool;
    [Providers.Claude]: ClaudeTool;
}

export const MessagesMappedToTools = new Map<string, string>([
    ["web_search", "Searching the web"],
    ["append_file", "Updating file"],
    ["create_file", "Creating file"],
    ["current_loc", "Looking for the current location"],
    ["make_dir", "Making directory"],
    ["write_file", "Updating file"],
    ["execute_command", "Executing"],
    ["parse_pdf", "Parsing pdf"],
    ["read_file", "Reading file"],
    ["copy_file", "Copy file"],
    ["delete_file_dir", "Delete"],
    ["move_file", "Move"],
    ["http_request", "Making a http request"],
    ["search_in_files", "Analyze"],
    ["parse_code", "Analyzing code structure"],
]);

export type AgentEvent =
    | { type: 'text'; content: string }
    | { type: 'thinking', content: string }
    | { type: 'tool'; name: string; message: string }
    | { type: 'debug'; level: 'error' | 'warning' | 'info'; title: string; message: string; details?: string }
    | { type: 'approval'; toolName: string; args: Record<string, any>; resolve: (approved: boolean) => void };

export interface SymbolInfo {
    id: string;
    name: string;
    signature?: string;
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
    isExported: boolean;
    isTopLevel: boolean;
    nodeDepth: number;
    parentId: string | null;
    salience: number;
}

export interface ImportInfo {
    id: string;
    moduleSpecifier: string;
    kind: 'default' | 'named' | 'namespace' | 'side-effect';
    startOffset: number;
    endOffset: number;
}

export interface StructuredIndex {
    functions: Record<string, SymbolInfo>;
    classes: Record<string, SymbolInfo>;
    imports: ImportInfo[];
}

export enum AgentMode {
    CHAT = 'chat',
    PLAN = 'plan',
    BUILD = 'build',
    ROAST = 'roast'
}

export type ChatItem =
    | { type: 'banner'; id: number }
    | { type: 'message'; id: number; role: 'user' | 'assistant'; content: string }
    | { type: 'thinking'; id: number; content: string }
    | { type: 'debug'; id: number; level: 'error' | 'warning' | 'info'; title: string; message: string; details?: string };
