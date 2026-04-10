import { memo } from 'react';
import { TextAttributes } from '@opentui/core';
import { AgentMode } from '../../types.js';

interface StatusBarProps {
    mode: AgentMode;
    thinkingEnabled: boolean;
    thinkingSupported: boolean;
    onModeChange: (mode: AgentMode) => void;
    onThinkingToggle: () => void;
}

const MODE_DISPLAY: Record<AgentMode, { label: string; color: string }> = {
    [AgentMode.CHAT]: { label: 'CHAT', color: '#99BB70' },
    [AgentMode.BUILD]: { label: 'BUILD', color: '#E8A838' },
    [AgentMode.PLAN]: { label: 'PLAN', color: '#7AA2F7' },
    [AgentMode.ROAST]: { label: 'ROAST', color: '#F7768E' },
};

export const StatusBar = memo(function StatusBar({
    mode,
    thinkingEnabled,
    thinkingSupported,
    onModeChange,
    onThinkingToggle,
}: StatusBarProps) {
    const modeInfo = MODE_DISPLAY[mode];

    return (
        <box style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            paddingX: 1,
            flexShrink: 0,
        }}>
            {/* Left: Mode indicator */}
            <box style={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <text style={{ fg: '#515A46' }}>
                    <span fg={modeInfo.color} attributes={TextAttributes.BOLD}>
                        {'● '}
                    </span>
                    <span fg={modeInfo.color}>{modeInfo.label}</span>
                </text>
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>
                    {'  Tab '}
                    <span fg='#515A46'>cycle</span>
                </text>
            </box>

            {/* Right: Thinking toggle */}
            {thinkingSupported && (
                <box style={{ flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                    <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>
                        {'Ctrl+T '}
                    </text>
                    <text style={{ fg: thinkingEnabled ? '#99BB70' : '#515A46' }}>
                        <span attributes={TextAttributes.BOLD}>
                            {thinkingEnabled ? '◉' : '○'}
                        </span>
                        {' thinking'}
                    </text>
                </box>
            )}
        </box>
    );
});
