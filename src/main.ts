#!/usr/bin/env node

import { render } from 'ink';
import React from 'react';
import { App } from './ui/App.js';
import { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import Conf from 'conf';
import LLMCore from "./core.js";
import { getInputPrompt_In, getListPrompt_In, getPasswordPrompt_In, getInputPrompt_InWithDefault } from "./inquirer.js";
import { Config, getModelsForProvider } from "./types.js";
import { Providers } from "./providers/index.js";
import { delete_curr_STMemory } from "./memory/memory.js";

const program = new Command();
const config = new Conf({ projectName: 'gloo-cli' });

program
    .version("1.0.6")
    .description("Your ai assistant in your cli")
    .addHelpText('after', `
        Getting Started:
            1. Run: gloo init
            2. Start chatting: gloo
        
        Commands:
            gloo init          Set up your first configuration
            gloo               Start interactive chat mode
            gloo ask "query"   Ask a one-off question
            gloo debug         Start chat with debug output
        
        Tips(for Interactive mode):
            - Press Ctrl+S in chat to open settings
            - Type 'q' in chat to quit
    `);

program
    .command('init')
    .description('Set up your first configuration')
    .action(async () => {
        console.log(chalk.magenta.bold('\nWelcome to Gloo! Let\'s set up your first configuration.\n'));

        const existingDefault = config.get('default');
        if (existingDefault) {
            console.log(chalk.yellow(`You already have a configuration: "${existingDefault}"`));
            console.log(chalk.yellow('Run `gloo` to start chatting, or use Ctrl+S for settings.\n'));
            return;
        }

        const configName = await getInputPrompt_InWithDefault('Enter a name for this configuration:', 'default');
        const provider = await getListPrompt_In(Object.values(Providers), 'Select your AI provider:');

        const models = getModelsForProvider(provider as Providers);
        const model = await getListPrompt_In(getModelsForProvider(provider as Providers), `Select a ${provider} model:`);
        const apiKey = await getPasswordPrompt_In(`Enter your ${provider} API key:`);
        const searchApiKey = await getPasswordPrompt_In('Enter your Tavily Search API key:');

        config.set(configName, {
            provider,
            model,
            api: apiKey.trim(),
            search_api: searchApiKey.trim()
        });
        config.set('default', configName);

        console.log(chalk.green.bold('\nConfiguration saved successfully!\n'));
        console.log(chalk.cyan('You can now run `gloo` to start chatting.'));
        console.log(chalk.cyan('Use Ctrl+S anytime to open settings.\n'));
    });

program
    .command('ask')
    .description('Ask your assistant any question')
    .argument('<query...>', "query you want to be answered")
    .action(async (allArgs) => {
        const query = allArgs.join(' ');
        const spinner = ora({ spinner: "dots8Bit" }).start();
        const default_config = config.get("default") as string;
        if (!default_config) {
            console.log(chalk.redBright.bold("You have not configured your cli yet"));
            process.exit(1);
        }
        const set_config = config.get(default_config) as Config;
        // console.log(JSON.stringify(set_config));
        if (!set_config) {
            spinner.fail("You haven't configured your provider and model yet");
            process.exit(1);
        } else {
            const search_api = set_config.search_api;
            const api = set_config.api;

            if (!api && !search_api) {
                spinner.fail("Api not found, Please set api for llm provider and search agent");
                process.exit(1);
            }

            if (!api) {
                spinner.fail("Api not found, Please set api for your provider");
                process.exit(1);
            }

            if (!search_api) {
                spinner.fail("Search api not found, Please set api for your search agent");
                process.exit(1);
            }

            try {
                const llm = new LLMCore(set_config.provider, set_config.model, api, search_api);
                spinner.stop();
                // console.log(chalk.cyan.bold("\n🤖: ", res));
                process.stdout.write(chalk.magenta.bold("\nGloo > \n"));
                for await (const chunk of llm.chat(query)) {
                    process.stdout.write(chalk.cyan(chunk));
                }
                process.stdout.write("\n");
            } catch (error) {
                if (process.env.GLOO_DEBUG === 'true') {
                    console.error('\n\nDEBUG ERROR [ask]:', error);
                    console.error('Stack:', (error as Error).stack);
                }
                spinner.fail('Failed to get response');
                console.error(chalk.red((error as Error).message));
                process.exit(1);
            }
        }
    })



program
    .command('debug')
    .description('Launch interactive mode with debug output')
    .action(async () => {
        process.env.GLOO_DEBUG = 'true';
        render(React.createElement(App));
    });

async function interactiveShell() {
    render(React.createElement(App));
}

process.on('exit', delete_curr_STMemory);

process.on('SIGHUP', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));

if (!process.argv.slice(2).length) {
    interactiveShell();
} else {
    program.parse(process.argv);
}