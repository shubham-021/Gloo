# Arka CLI

A conversational AI assistant for the terminal. Configure multiple LLM providers, store credentials locally, and chat with an AI assistant directly from your shell.

## Supported Providers

1. OpenAI (GPT 4, GPT 4o mini, GPT 4 Turbo)
2. Anthropic (Claude 3 Opus, Sonnet, Haiku)
3. Google Gemini (Gemini 1.5 Pro, Flash, 2.5 Pro, Flash)

## Prerequisites

1. Node.js 18 or higher
2. pnpm package manager
3. API key from your chosen provider
4. Tavily API key for web search

## Installation

### From npm (Global)

```sh
npm install -g @arka07/clai
```

### From Source

```sh
git clone https://github.com/shubham-021/cli-with-ai.git
cd cli-with-ai
pnpm install
pnpm exec tsc
node dist/main.js
```

## Setup

1. Configure a provider and model:
```sh
arka configure -n myconfig
```

2. Set your API keys:
```sh
arka set-api -n myconfig --api YOUR_PROVIDER_API_KEY --search YOUR_TAVILY_KEY
```

3. Start asking questions:
```sh
arka ask "What is the capital of France?"
```

## Commands

| Command | Description |
|---------|-------------|
| `arka configure -n <name>` | Create a new configuration with provider and model selection |
| `arka set-api -n <name> --api <key> --search <key>` | Set API keys for a configuration |
| `arka ask <question>` | Ask a question using the default configuration |
| `arka switch -n <name>` | Switch the default configuration |
| `arka see-config` | View saved configurations |
| `arka see-api` | View current API key status |
| `arka delete-config -n <name>` | Delete a configuration |
| `arka` | Launch interactive shell mode |

## Interactive Mode

Run `arka` without arguments to enter interactive mode. Type your questions and press Enter. Type `q` or `quit` to exit.

## Project Structure

```
src/
  main.ts           Entry point and CLI commands
  core.ts           LLM initialization
  agent/            ReAct agent implementation
  providers/        Direct API clients for each provider
  tools/            Tool definitions and registry
  memory/           Conversation memory management
```

