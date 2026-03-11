import { ChatProvider, ChatMessage, ChatResponse, InvokeOptions, ToolCall } from './chat-provider.js';

export class OpenAIProvider implements ChatProvider {
    private apiKey: string;
    private model: string;
    private baseUrl = 'https://api.openai.com/v1';

    constructor(options: { model: string; apiKey: string }) {
        this.model = options.model;
        this.apiKey = options.apiKey;
    }

    private buildInput(messages: ChatMessage[]): any[] {
        const input: any[] = [];

        for (const m of messages as any[]) {
            if (m.role === 'tool') {
                input.push({
                    type: 'function_call_output',
                    call_id: m.tool_call_id,
                    output: m.content
                });
            } else if (m.tool_calls) {
                if (m.content) {
                    input.push({ role: 'assistant', content: m.content });
                }
                for (const tc of m.tool_calls) {
                    input.push({
                        type: 'function_call',
                        call_id: tc.id,
                        name: tc.name,
                        arguments: JSON.stringify(tc.args)
                    });
                }
            } else {
                input.push({
                    role: m.role === 'system' ? 'developer' : m.role,
                    content: m.content
                });
            }
        }

        return input;
    }


    async invoke(messages: ChatMessage[], options?: InvokeOptions): Promise<ChatResponse> {
        const body: any = {
            model: this.model,
            input: this.buildInput(messages)
        };

        if (options?.tools?.length) {
            body.tools = options.tools;
            body.tool_choice = options.tool_choice ?? 'auto';

            // if (process.env.GLOO_DEBUG === 'true') {
            //     console.log('OPENAI TOOLS SCHEMA');
            //     console.log(`${JSON.stringify(options.tools[0], null, 2).split('\n')}`);
            // }
        }

        if (options?.thinking) {
            body.reasoning = {
                effort: options.reasoningEffort ?? 'medium',
                summary: 'auto'
            }
        }

        const response = await fetch(`${this.baseUrl}/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body),
            signal: options?.signal
        });

        if (!response.ok) {
            const error = await response.text();
            if (process.env.GLOO_DEBUG === 'true') {
                console.error('\n\nDEBUG ERROR [OpenAI invoke]:', error);
            }
            throw new Error(`OpenAI API error: ${response.status} - ${error}`);
        }

        const data = await response.json();

        let content = '';
        let thinking = '';
        const tool_calls: ToolCall[] = [];

        for (const item of data.output) {
            if (item.type === 'message') {
                for (const part of item.content) {
                    if (part.type === 'output_text') {
                        content += part.text;
                    }
                }
            } else if (item.type === 'function_call') {
                let args = {};
                try {
                    args = typeof item.arguments === 'string' ? JSON.parse(item.arguments) : item.arguments ?? {};
                } catch (e) {
                    if (process.env.GLOO_DEBUG === 'true') {
                        console.error('\n\nDEBUG: Failed to parse tool args:', item.arguments);
                    }
                }

                tool_calls.push({
                    id: item.call_id,
                    name: item.name,
                    args
                })
            } else if (item.type === 'reasoning') {
                for (const entry of item.summary ?? []) {
                    if (entry.type === 'summary_text') {
                        thinking += entry.text;
                    }
                }
            }
        }

        return {
            content,
            thinking: thinking || undefined,
            tool_calls
        };
    }

    async *stream(messages: ChatMessage[], signal?: AbortSignal, thinking?: boolean, reasoningEffort?: 'low' | 'medium' | 'high'): AsyncGenerator<{ text?: string, thinking?: string }> {
        const body: any = {
            model: this.model,
            input: this.buildInput(messages),
            stream: true
        };

        if (thinking) {
            body.reasoning = {
                effort: reasoningEffort ?? 'medium',
                summary: 'auto'
            };
        }

        const response = await fetch(`${this.baseUrl}/responses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(body),
            signal
        });

        if (!response.ok) {
            if (process.env.GLOO_DEBUG === 'true') {
                console.error('\n\nDEBUG ERROR [OpenAI stream]:', response.status);
            }
            throw new Error(`OpenAI API error: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() ?? '';

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    const data = line.slice(6);
                    if (data === '[DONE]') return;

                    try {
                        const parsed = JSON.parse(data);

                        if (parsed.type === 'response.output_text.delta') {
                            yield { text: parsed.delta };
                        } else if (parsed.type === 'response.reasoning_summary_text.delta') {
                            yield { thinking: parsed.delta };
                        }
                    } catch {
                        // Skip invalid JSON
                    }
                }
            }
        }
    }
}