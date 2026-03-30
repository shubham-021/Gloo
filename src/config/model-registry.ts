import { Providers } from '../providers/index.js';

export interface ModelMeta {
    id: string;
    label: string;
    provider: Providers;
    contextWindow: number;
    supportsThinking: boolean;
    description: string;
}

const MODELS: ModelMeta[] = [
    // OpenAI
    { id: 'gpt-5', label: 'GPT-5', provider: Providers.OpenAI, contextWindow: 128000, supportsThinking: true, description: 'Most capable OpenAI model' },
    { id: 'gpt-4.1', label: 'GPT-4.1', provider: Providers.OpenAI, contextWindow: 128000, supportsThinking: false, description: 'Improved GPT-4 variant' },
    { id: 'gpt-4o', label: 'GPT-4o', provider: Providers.OpenAI, contextWindow: 128000, supportsThinking: false, description: 'Fast multimodal model' },
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini', provider: Providers.OpenAI, contextWindow: 128000, supportsThinking: false, description: 'Lightweight and fast' },
    { id: 'o3', label: 'o3', provider: Providers.OpenAI, contextWindow: 200000, supportsThinking: true, description: 'Advanced reasoning' },
    { id: 'o3-mini', label: 'o3 Mini', provider: Providers.OpenAI, contextWindow: 200000, supportsThinking: true, description: 'Compact reasoning model' },
    { id: 'o4-mini', label: 'o4 Mini', provider: Providers.OpenAI, contextWindow: 200000, supportsThinking: true, description: 'Latest compact reasoning' },

    // Gemini
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro', provider: Providers.Gemini, contextWindow: 1000000, supportsThinking: true, description: 'Large context, strong coding' },
    { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash', provider: Providers.Gemini, contextWindow: 1000000, supportsThinking: true, description: 'Fast with thinking' },
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash', provider: Providers.Gemini, contextWindow: 1000000, supportsThinking: false, description: 'Previous gen fast model' },
    { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro', provider: Providers.Gemini, contextWindow: 2000000, supportsThinking: false, description: 'Large context pro model' },
    { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash', provider: Providers.Gemini, contextWindow: 1000000, supportsThinking: false, description: 'Previous gen flash' },

    // Claude
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet 4.6', provider: Providers.Claude, contextWindow: 200000, supportsThinking: true, description: 'Balanced speed and intelligence' },
    { id: 'claude-opus-4-6', label: 'Claude Opus 4.6', provider: Providers.Claude, contextWindow: 200000, supportsThinking: true, description: 'Most capable Claude model' },
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku 4.5', provider: Providers.Claude, contextWindow: 200000, supportsThinking: false, description: 'Fast and lightweight' },
];

export function getModelsForProvider(provider: Providers): ModelMeta[] {
    return MODELS.filter(m => m.provider === provider);
}

export function getModelMeta(modelId: string): ModelMeta | undefined {
    return MODELS.find(m => m.id === modelId);
}

export function isValidModelForProvider(modelId: string, provider: Providers): boolean {
    return MODELS.some(m => m.id === modelId && m.provider === provider);
}

export function getDefaultModelForProvider(provider: Providers): string {
    return getModelsForProvider(provider)[0].id;
}
