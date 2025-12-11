import { Providers, ProviderMap } from './types.js';
import { ReActAgent } from './agent/index.js';
import { ToolRegistry } from './tools/registry.js';
import { allTools } from './tools/all.js';
class LLMCore {
    private agent: ReActAgent;
    constructor(
        provider: Providers,
        model: string,
        api: string,
        searchApi: string
    ) {
        const LLM = ProviderMap[provider];
        const llm = new LLM({ model, apiKey: api });

        const toolRegistry = new ToolRegistry();
        toolRegistry.registerAll(allTools(searchApi));

        this.agent = new ReActAgent({ llm, toolRegistry, provider });
    }
    async *chat(query: string): AsyncGenerator<string> {
        yield* this.agent.run(query);
    }
}
export default LLMCore;