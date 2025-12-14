import inquirer from "inquirer";
import { getModelsForProvider } from "./types.js";
import { Providers } from "./providers/index.js";
import chalk from "chalk";


export async function getListPrompt_In(choices: Array<string>, message: string): Promise<string> {
    const { choice } = await inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message,
            choices
        }
    ])

    return choice;
}

export async function getInputPrompt_In(): Promise<string> {
    const answer: { command: string } = await inquirer.prompt([{
        type: 'input',
        name: 'command',
        message: chalk.cyan.bold('arka > ')
    }]);

    return answer.command;
}

export async function getPasswordPrompt_In(message: string): Promise<string> {
    const { value } = await inquirer.prompt([{
        type: 'password',
        name: 'value',
        message,
        mask: '*',
        validate: (input: string) => input.trim() ? true : 'This field is required'
    }]);
    return value;
}

export async function getInputPrompt_InWithDefault(message: string, defaultValue?: string): Promise<string> {
    const { value } = await inquirer.prompt([{
        type: 'input',
        name: 'value',
        message,
        default: defaultValue,
        validate: (input: string) => input.trim() ? true : 'This field is required'
    }]);
    return value;
}