import { AIMessage, HumanMessage, SystemMessage } from 'langchain';
import { ChatModels, Message, Providers } from '../types.js';
import { ToolRegistry } from '../tools/registry.js';
import { getSystemPrompt } from './system-prompt.js';
import { load_STMemory, load_LTMemory, saveSTMemory } from '../memory/memory.js';
import { getListPrompt_In } from '../inquirer.js';

const MAX_STEPS = 20;  // Like AI SDK's stepCountIs(20)

export class ReActAgent {
    private llm: ChatModels;
    private toolRegistry: ToolRegistry;
    private provider: Providers;

    constructor(options: {
        llm: ChatModels;
        toolRegistry: ToolRegistry;
        provider: Providers;
    }) {
        this.llm = options.llm;
        this.toolRegistry = options.toolRegistry;
        this.provider = options.provider;
    }

    async *run(query: string): AsyncGenerator<string> {
        // Build context for system prompt
        const systemPrompt = getSystemPrompt({
            cwd: process.cwd(),
            date: new Date().toLocaleDateString(),
            shortTermMemory: load_STMemory(),
            longTermMemory: load_LTMemory()
        });
        const messages: Message[] = [
            new SystemMessage(systemPrompt),
            new HumanMessage(query)
        ];
        const tools = this.toolRegistry.getForProvider(this.provider);
        let stepCount = 0;
        // The ReAct loop (like AI SDK's do-while)
        while (stepCount < MAX_STEPS) {
            stepCount++;
            // Call LLM with tools
            const response = await this.llm.invoke(messages, {
                tools,
                tool_choice: 'auto'
            });
            // No tool calls = we're done, stream the response
            if (!response.tool_calls || response.tool_calls.length === 0) {
                // Stream the text
                const stream = await this.llm.stream(messages);
                let fullText = '';
                for await (const chunk of stream) {
                    if (chunk.text) {
                        yield chunk.text;
                        fullText += chunk.text;
                    }
                }

                // Save to memory
                saveSTMemory([
                    { role: 'user', content: query },
                    { role: 'assistant', content: fullText }
                ]);
                return;
            }
            // Execute tool calls
            messages.push(new AIMessage(response));
            for (const toolCall of response.tool_calls) {
                const tool = this.toolRegistry.get(toolCall.name);

                // Check if approval needed
                if (tool?.needsApproval) {
                    const shouldApprove = typeof tool.needsApproval === 'function'
                        ? tool.needsApproval(toolCall.args)
                        : tool.needsApproval;

                    if (shouldApprove) {
                        const choice = await getListPrompt_In(
                            ['Approve', 'Deny'],
                            `Tool "${toolCall.name}" wants to: ${JSON.stringify(toolCall.args)}`
                        );
                        if (choice === 'Deny') {
                            messages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                name: toolCall.name,
                                content: 'User denied this action.'
                            });
                            continue;
                        }
                    }
                }
                // Execute the tool
                let result: string;
                try {
                    result = await this.toolRegistry.execute(
                        toolCall.name,
                        toolCall.args,
                        { cwd: process.cwd() }
                    );
                } catch (error) {
                    result = `Error: ${(error as Error).message}`;
                }
                messages.push({
                    role: 'tool',
                    tool_call_id: toolCall.id,
                    name: toolCall.name,
                    content: result
                });
            }

            // Loop continues...
        }
        yield '\n[Stopped after maximum steps reached]';
    }
}