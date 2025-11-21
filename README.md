# Arka CLI

Arka is a terminal-first AI assistant that routes every prompt to the most appropriate workflow—simple chat, web search, or a build-mode planner/executor loop—across OpenAI, Anthropic, or Google Gemini models. It runs entirely in your local shell, keeps per-provider credentials in Conf, and enforces CLI-only responses so generated answers stay in the terminal unless you explicitly request file edits.

## Key Capabilities
- **Provider agnostic**: Pick GPT-4/5, Claude 3.x, Gemini 1.5/2.5 (and custom IDs) via interactive menus.
- **Local credential store**: `conf` keeps LLM and Tavily search keys per named config; no need to re-enter secrets.
- **Router + DEC classifier**: Automatically separates web/info queries from project-aware build tasks.
- **Planner/executor pipeline**: Planner emits capability-tagged steps; executor runs them sequentially with LangChain tools while obeying the “CLI output only” rule.
- **Tool registry**: Centralized tool definitions (`src/tools.ts`) expose fs, shell, and web-search helpers to every model.
- **Memory summaries**: Conversations are compressed after each run so future calls stay in context.
- **Commander-based CLI**: Friendly `arka` binary with `configure`, `set-api`, `ask`, and other admin commands.

## Installation
```bash
npm install -g @arka07/clai
```
Requirements: Node.js 18+, a supported LLM provider key, and a Tavily API key for search-enabled answers.

## Quick Start
1. `arka configure -n first-run` – choose provider/model and set defaults.
2. `arka set-api -n first-run --api <llm_key>` – store the model key securely.
3. `arka set-api -n first-run --search <tavily_key>` – enable web/search tool calls.
4. `arka ask "Summarize src/core.ts"` – the router will pick build mode, plan the steps, and stream the final summary directly to your terminal.

All results stay in the CLI unless you explicitly request file creation or edits.

## CLI Commands
- `arka configure (-n <name>)`: Create/update configs; optional `-p` or `-m` flags limit prompts to provider/model reselection.
- `arka set-api -n <name> (--api|--search <key>)`: Persist LLM or Tavily keys.
- `arka delete-config -n <name>`: Remove a config and its secrets.
- `arka see-config`: List saved configs via Inquirer and print the selected payload.
- `arka see-api`: Display the default config’s stored keys (if present).
- `arka switch -n <name>`: Mark a config as default for future runs.
- `arka ask <query>`: Run the agent; automatically decides between simple prompt, search, or planner/executor build loop.

## Planner / Executor Workflow
1. **Router** (`src/prompt/router.ts`) tags build queries and appends `CLI_OUTPUT_ONLY_NO_UNREQUESTED_FILE_CREATION` so downstream prompts inherit the constraint.
2. **Planner** (`src/prompt/planner.ts`) outputs numbered steps in the form `"<n>. Use Capability <1|2|3|4> to <action>."` and forbids Capability 1 (local context) from touching files unless you asked for the modification.
3. **Executor** (`src/prompt/executer.ts`) executes each step sequentially, selecting tools that express the requested capability. It refuses to create files purely to show results and instead prints responses straight to the CLI.

Capabilities:
| ID | Purpose | Examples |
|----|---------|----------|
| 1  | Local context interaction | read/write project files, inspect code |
| 2  | External knowledge access | Tavily web search, reference lookups |
| 3  | System/utility operations | run scripts, installs, commands |
| 4  | Pure reasoning/analysis | summarize, decide, draft final answer |

## Search Workflow
When the router picks the `search` tool, `src/core.ts` loads the `get_simple_prompt`, invokes the model with web-search enabled tools, and still enforces CLI-only outputs. Tavily results are summarized before returning to the user.

## Memory & Persistence
- `loadMemory` / `saveMemory` summarize transcripts after each interaction so future prompts include a compact context snippet.
- Configs live under the Conf store keyed by the name you pass to CLI switches.


