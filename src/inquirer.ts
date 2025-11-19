import inquirer from "inquirer";
import { getModelsForProvider, Providers } from "./types.js";

export async function selectProviderandModel(){
    const {provider} = await inquirer.prompt([
        {
            type: 'list',
            name: 'provider',
            message: 'Select a provider from the list: ',
            choices: Object.values(Providers)
        }
    ]);

    const availableModels = getModelsForProvider(provider as Providers);

    const {model} = await inquirer.prompt([
        {
            type: 'list',
            name: 'model',
            message: `Select a ${provider} model from the list: `,
            choices: availableModels
        }
    ]);

    return {provider,model};
}

export async function selectModel(provider:string){
    const availableModels = getModelsForProvider(provider as Providers);

    const {model} = await inquirer.prompt([
        {
            type: 'list',
            name: 'model',
            message: `Select a ${provider} model from the list: `,
            choices: availableModels
        }
    ]);

    return model;
}

export async function selectConfig(configList:string[]){
    const {config_s} = await inquirer.prompt([
        {
            type: 'list',
            name: 'config_s',
            message: `Select from the list: `,
            choices: configList
        }
    ]);

    return config_s;
}