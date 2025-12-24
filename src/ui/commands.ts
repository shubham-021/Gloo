import { AgentMode, ChatItem } from '../types.js';

interface CommandContext {
    exit: () => void;
    setShowSettings: (show: boolean) => void;
    setInput: (input: string) => void;
    setMode: (mode: AgentMode) => void;
    setChatItems: (fn: (prev: ChatItem[]) => ChatItem[]) => void;
    addChatItem: (prev: ChatItem[], ...items: ChatItem[]) => ChatItem[];
    nextId: () => number;
}

const HELP_MESSAGE = `Available Commands:
  /chat      Chat mode
  /plan      Plan mode  
  /build     Build mode
  /clear     Reset screen
  q          Quit
  s          Settings
`;

export function executeCommand(input: string, ctx: CommandContext): boolean {
    const cmd = input.toLowerCase();

    switch (cmd) {
        case 'q':
        case 'quit':
            ctx.exit();
            return true;

        case 's':
        case 'settings':
        case '/settings':
            ctx.setShowSettings(true);
            ctx.setInput('');
            return true;

        case '/clear':
        case 'clear':
            process.stdout.write('\x1B[2J\x1B[H');
            ctx.setChatItems(() => [{ type: 'banner', id: ctx.nextId() }]);
            ctx.setInput('');
            return true;

        case '/chat':
        case 'chat':
            ctx.setMode(AgentMode.CHAT);
            ctx.setChatItems(prev => ctx.addChatItem(prev,
                { type: 'message', id: ctx.nextId(), role: 'assistant', content: 'Switched to Chat Mode' }
            ));
            ctx.setInput('');
            return true;

        case '/plan':
        case 'plan':
            ctx.setMode(AgentMode.PLAN);
            ctx.setChatItems(prev => ctx.addChatItem(prev,
                { type: 'message', id: ctx.nextId(), role: 'assistant', content: 'Switched to Plan Mode' }
            ));
            ctx.setInput('');
            return true;

        case '/build':
        case 'build':
            ctx.setMode(AgentMode.BUILD);
            ctx.setChatItems(prev => ctx.addChatItem(prev,
                { type: 'message', id: ctx.nextId(), role: 'assistant', content: 'Switched to Build Mode' }
            ));
            ctx.setInput('');
            return true;

        case 'help':
            ctx.setChatItems(prev => ctx.addChatItem(prev,
                { type: 'message', id: ctx.nextId(), role: 'user', content: 'help' },
                { type: 'message', id: ctx.nextId(), role: 'assistant', content: HELP_MESSAGE }
            ));
            ctx.setInput('');
            return true;

        default:
            return false;
    }
}