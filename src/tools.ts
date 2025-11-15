import { TavilySearch } from "@langchain/tavily";

export class Tools{
    private search_model:TavilySearch;

    constructor(api:string){
        this.search_model = new TavilySearch({tavilyApiKey:api,maxResults:5})
    };

    async web_search(arg:{query:string}){
        try{
            const search_res = await this.search_model.invoke(arg);
            return search_res;
        }catch(error){
            throw new Error((error as Error).message);
        }
    }
}