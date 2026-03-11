import React, { useState } from 'react';
import { theme } from '../theme.js';
import { useKeyboard } from '@opentui/react';
import { TextAttributes } from '@opentui/core';

interface ApprovalPromptProps {
    toolName: string;
    args: Record<string, any>;
    onApprove: () => void;
    onDeny: () => void;
}

export function ApprovalPrompt({ toolName, args, onApprove, onDeny }: ApprovalPromptProps) {
    const [selected, setSelected] = useState<'approve' | 'deny'>('approve');

    useKeyboard((key) => {
        if (key.name === 'left' || key.name === 'right' || key.name === 'a' || key.name === 'd') {
            setSelected(prev => prev === 'approve' ? 'deny' : 'approve');
        }
        if (key.name === 'return') {
            if (selected === 'approve') {
                onApprove();
            } else {
                onDeny();
            }
        }
        if (key.name === 'y' || key.name === 'Y') {
            onApprove();
        }
        if (key.name === 'n' || key.name === 'N') {
            onDeny();
        }
    });

    const formatArgs = (args: Record<string, any>): string => {
        return Object.entries(args)
            .map(([key, value]) => {
                const val = typeof value === 'string'
                    ? (value.length > 60 ? value.slice(0, 60) + '...' : value)
                    : JSON.stringify(value);
                return `  ${key}: ${val}`;
            })
            .join('\n');
    };

    return (
        <box
            flexDirection="column"
            borderStyle="rounded"
            borderColor={theme.colors.warning}
            paddingX={2}
            paddingY={1}
            marginY={1}
        >
            <box gap={1} marginBottom={1}>
                <text fg={theme.colors.warning}>⚠</text>
                <text fg={theme.colors.warning} attributes={TextAttributes.BOLD}>Approval Required</text>
            </box>

            <box flexDirection="column" paddingLeft={2}>
                <text fg={theme.colors.text}>
                    <text attributes={TextAttributes.BOLD}>{toolName}</text> wants to execute:
                </text>
                <box marginY={1}>
                    <text fg={theme.colors.textMuted}>{formatArgs(args)}</text>
                </box>
            </box>

            <box marginTop={1} gap={2} justifyContent="center">
                <box
                    paddingX={2}
                    paddingY={0}
                    borderStyle="rounded"
                    borderColor={selected === 'approve' ? theme.colors.success : theme.colors.border}
                >
                    <text
                        fg={selected === 'approve' ? theme.colors.success : theme.colors.textDim}
                        attributes={TextAttributes.BOLD}
                    >
                        {selected === 'approve' ? '► ' : '  '}Approve (Y)
                    </text>
                </box>
                <box
                    paddingX={2}
                    paddingY={0}
                    borderStyle="rounded"
                    borderColor={selected === 'deny' ? theme.colors.error : theme.colors.border}
                >
                    <text
                        fg={selected === 'deny' ? theme.colors.error : theme.colors.textDim}
                    // bold={selected === 'deny'}
                    >
                        {selected === 'deny' ? '► ' : '  '}Deny (N)
                    </text>
                </box>
            </box>

            <box marginTop={1} justifyContent="center">
                <text fg={theme.colors.textDim}>
                    Use ←/→ or A/D to select, Enter to confirm
                </text>
            </box>
        </box>
    );
}
