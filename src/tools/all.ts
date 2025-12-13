import { ToolDefinition } from './types.js';
import {
    makeWebSearchTool,
    readFileTool,
    writeFileTool,
    createFileTool,
    appendFileTool,
    makeDirTool,
    currentLocTool,
    deleteFileDirTool,
    moveFileTool,
    copyFileTool,
    executeCommandTool,
    parsePdfTool,
    searchInFilesTool,
    httpRequestTool,
    parseCodeTool
} from './definitions.js';

export function allTools(tavilyApiKey: string): ToolDefinition[] {
    return [
        makeWebSearchTool(tavilyApiKey),
        readFileTool,
        writeFileTool,
        createFileTool,
        appendFileTool,
        makeDirTool,
        currentLocTool,
        deleteFileDirTool,
        moveFileTool,
        copyFileTool,
        executeCommandTool,
        parsePdfTool,
        searchInFilesTool,
        httpRequestTool,
        parseCodeTool
    ];
}