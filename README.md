# Arka CLI

Arka is a conversational AI assistant for the terminal. Once installed globally from npm (`npm install -g @akra07/clai`), it exposes the `arka` command so you can configure multiple LLM providers, store credentials locally, and converse with a dedicated assistant directly from your shell.

## What It Uses
- `commander` for the multi-command CLI interface.
- `chalk` + `figlet` for colorful banners and readable terminal messages.
- `ora` for request spinners and status feedback.
- `conf` to persist provider/model selections plus API secrets on disk.
- `inquirer` for interactive prompts when configuring or running the shell mode.
- `langchain` as the orchestration layer, with provider clients `@langchain/openai`, `@langchain/anthropic`, and `@langchain/google-genai`.
- `@langchain/tavily` to reach Tavily’s search API for retrieval-augmented responses.
- `pdf-parse` to ingest document content inside the assistant’s toolchain.
- `zod` for runtime validation of user-supplied configuration data.

## How It Works
1. `arka configure -n <config_name>` walks you through selecting a provider and model, stores them, and marks the config as default.
2. `arka set-api -n <config_name> --api <llm_key> --search <tavily_key>` saves the credentials for that config.
3. `arka ask "your question"` loads the default config, initializes the `LLMCore`, and streams back the model’s answer, showing spinner status via `ora`.
4. `arka switch -n <config_name>` lets you jump between saved setups, while `arka see-config` and `arka see-api` surface the stored values.
5. `arka delete-config -n <config_name>` removes entries you no longer need.

If you run `arka` without arguments, it launches an interactive shell that prints a Figlet banner, accepts natural-language questions, and keeps a persistent REPL until you type `q`/`quit` or press `Ctrl+C`.

## Using It After `npm i -g`
```sh
npm install -g <package-name>
arka configure -n my-setup
arka set-api -n my-setup --api sk-... --search tavily-...
arka ask "Who won the recent World Cup?"
```

Tips:
- Always set both the model API key and the Tavily search key; the assistant won’t answer without them.
- Use `arka configure -n my-setup -m` or `-p` to update just the model or provider of an existing config.
- `arka` in interactive mode only handles Q&A; run configuration commands from your normal terminal session.

