import { TextAttributes } from "@opentui/core";

interface Command {
    key: string;
    description: string;
    type: 'shortcut' | 'command';
}

const COMMANDS: Command[] = [
    { key: 'Ctrl + M', description: 'Toggle model selector', type: 'shortcut' },
    { key: 'Ctrl + Enter', description: 'Toggle debug console', type: 'shortcut' },
    { key: 'Ctrl + K', description: 'Focus input', type: 'shortcut' },
    { key: 'Esc', description: 'Close active overlay', type: 'shortcut' },
    { key: ':q', description: 'Quit application', type: 'command' },
    { key: '/console', description: 'Toggle debug console', type: 'command' },
    { key: '/model', description: 'Open model selector', type: 'command' },
    { key: '/help', description: 'Show this command list', type: 'command' },
    { key: '/clear', description: 'Clear chat history', type: 'command' },
    { key: '/config', description: 'Open configuration editor', type: 'command' },
    { key: '/export', description: 'Export current session', type: 'command' },
];

export function CommandPalette({ onClose }: { onClose: () => void }) {
    const shortcuts = COMMANDS.filter(c => c.type === 'shortcut');
    const commands = COMMANDS.filter(c => c.type === 'command');

    return (
        <box style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <box style={{
                width: '80%',
                flexDirection: 'column',
                border: true,
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                backgroundColor: '#151613',
                padding: 1,
                gap: 1,
            }}>
                {/* Header */}
                <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>Commands</text>
                    <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to close</text>
                </box>

                {/* Shortcuts Section */}
                <box style={{ flexDirection: 'column' }}>
                    <text style={{ fg: '#B5BAAF', attributes: TextAttributes.DIM | TextAttributes.BOLD }}>Keyboard Shortcuts</text>
                    <box style={{ flexDirection: 'column' }}>
                        {shortcuts.map((cmd) => (
                            <box key={cmd.key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingX: 1 }}>
                                <text style={{ fg: '#99BB70' }}>{cmd.key}</text>
                                <text style={{ fg: '#B5BAAF' }}>{cmd.description}</text>
                            </box>
                        ))}
                    </box>
                </box>

                {/* Commands Section */}
                <box style={{ flexDirection: 'column' }}>
                    <text style={{ fg: '#B5BAAF', attributes: TextAttributes.DIM | TextAttributes.BOLD }}>Slash Commands</text>
                    <box style={{ flexDirection: 'column' }}>
                        {commands.map((cmd) => (
                            <box key={cmd.key} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingX: 1 }}>
                                <text style={{ fg: '#99BB70' }}>{cmd.key}</text>
                                <text style={{ fg: '#B5BAAF' }}>{cmd.description}</text>
                            </box>
                        ))}
                    </box>
                </box>
            </box>
        </box>
    );
}
