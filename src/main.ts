#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk"; 
import figlet from "figlet";
import ora, { spinners } from "ora";
import Conf from 'conf';
import LLMCore from "./core.js";
import { selectProviderandModel } from "./inquirer.js";
import { Config } from "./types.js";
import inquirer from "inquirer";

const program = new Command();
const config = new Conf({projectName: 'arka-cli'});

program
    .version("0.0.1")
    .description("Your ai assistant in your cli")
    .addHelpText('after', `
        Getting Started:
          1. Configure your provider and model: arka configure
          2. Set your API key: arka set-api --api <api_key>
          3. Set you API key for tavily: arka set-api --search <api_key>
          4. Start asking questions: arka ask "your question"
        
        Example:
          $ arka configure
          $ arka set-api --api <api_key>
          $ arka set-api --search <api_key>
          $ arka ask Who won the recent fifa worldcup and why is ronaldo crying
    `);

program
    .command('set-api')
    .description('Set api for your model and search agent')
    .option('--api <value>','api')
    .option('--search <value>','search_api')
    .action((options)=>{
        const set_config = config.get("config") as Config;
        if(!set_config || set_config == undefined){
            console.log(chalk.bold.red("Configure your model and provider first"));
            process.exit(1);
        }

        const provider = set_config.provider;
        const model = set_config.model;

        const { api, search } = options;

        if(api){
            config.set("config.api",api);
            console.log(chalk.greenBright(`Api set for ${provider} - ${model}`));
        };

        if(search){
            config.set("config.search_api",search);
            console.log(chalk.greenBright("Api set for search agent"));
        }
    })

program 
    .command("delete-config")
    .action(async ()=>{
       config.delete("config");
    })

program.
    command('see-api')
    .action(()=>{
        const api = config.get("config.api");
        const search_api = config.get("config.search_api");
        console.log(api ? chalk.bold.green("Api: ",api,"\n") : chalk.bold.red("Api not set") , search_api ? chalk.bold.green("Search_api: ",search_api) : chalk.bold.red("Search api not set"));
    })


program
    .command('ask')
    .description('Ask your assistant any question')
    .argument('<query...>',"query you want to be answered")
    .action(async (allArgs)=>{
        const query = allArgs.join(' ');
        const spinner = ora({spinner:"dots8Bit"}).start();
        const set_config = config.get("config") as Config;
        // console.log(JSON.stringify(set_config));
        if(!set_config){
            spinner.fail("You haven't configured your provider and model yet");
            process.exit(1);
        }else{
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
                const llm = new LLMCore(set_config.provider,set_config.model,api,search_api);
                const res = await llm.query(query);
                spinner.stop();
                console.log(chalk.cyan.bold("\n🤖: ",res));
                // for await (const chunk of stream) {
                //     process.stdout.write(chunk);
                // }
                console.log("\n");
            } catch (error) {
                spinner.fail('Failed to get response');
                console.error(chalk.red((error as Error).message));
                process.exit(1);
            }
        }
    })

program
    .command('configure')
    .description('Configure AI provider and model')
    .action(async() => {
        const {provider , model} = await selectProviderandModel();
        config.set("config",{provider,model,api:"",search_api:""})
        console.log(chalk.greenBright(`Selected: ${provider} - ${model} \n`));
        console.log(chalk.yellowBright.bold("Set your api key by running the command <set-api> \n"));
    })

// process.argv returns an array containing all the command-line arguments passed when the Node.js process was launched.
// The array always has at least two elements by default.
// [
//     '/usr/local/bin/node',           // process.argv[0]
//     '/path/to/your/app.js',          // process.argv[1]
//     'calculate',                      // process.argv[2]
//     '--sum',                          // process.argv[3]
//     '5'                              // process.argv[4]
// ]

if (!process.argv.slice(2).length) {
    console.log(chalk.cyan(figlet.textSync("Arka",{horizontalLayout:"full",verticalLayout:"full",width:180})));
    program.outputHelp();
}

program.parse(process.argv);