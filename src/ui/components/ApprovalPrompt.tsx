import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { theme } from '../theme.js';

interface ApprovalPromptProps {
    toolName: string;
    args: Record<string, any>;
    onApprove: () => void;
    onDeny: () => void;
}

export function ApprovalPrompt({ toolName, args, onApprove, onDeny }: ApprovalPromptProps) {
    const [selected, setSelected] = useState<'approve' | 'deny'>('approve');

    useInput((input, key) => {
        if (key.leftArrow || key.rightArrow || input === 'a' || input === 'd') {
            setSelected(prev => prev === 'approve' ? 'deny' : 'approve');
        }
        if (key.return) {
            if (selected === 'approve') {
                onApprove();
            } else {
                onDeny();
            }
        }
        if (input === 'y' || input === 'Y') {
            onApprove();
        }
        if (input === 'n' || input === 'N') {
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
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={theme.colors.warning}
            paddingX={2}
            paddingY={1}
            marginY={1}
        >
            <Box gap={1} marginBottom={1}>
                <Text color={theme.colors.warning}>⚠</Text>
                <Text color={theme.colors.warning} bold>Approval Required</Text>
            </Box>

            <Box flexDirection="column" paddingLeft={2}>
                <Text color={theme.colors.text}>
                    <Text bold>{toolName}</Text> wants to execute:
                </Text>
                <Box marginY={1}>
                    <Text color={theme.colors.textMuted}>{formatArgs(args)}</Text>
                </Box>
            </Box>

            <Box marginTop={1} gap={2} justifyContent="center">
                <Box
                    paddingX={2}
                    paddingY={0}
                    borderStyle="round"
                    borderColor={selected === 'approve' ? theme.colors.success : theme.colors.border}
                >
                    <Text
                        color={selected === 'approve' ? theme.colors.success : theme.colors.textDim}
                        bold={selected === 'approve'}
                    >
                        {selected === 'approve' ? '► ' : '  '}Approve (Y)
                    </Text>
                </Box>
                <Box
                    paddingX={2}
                    paddingY={0}
                    borderStyle="round"
                    borderColor={selected === 'deny' ? theme.colors.error : theme.colors.border}
                >
                    <Text
                        color={selected === 'deny' ? theme.colors.error : theme.colors.textDim}
                        bold={selected === 'deny'}
                    >
                        {selected === 'deny' ? '► ' : '  '}Deny (N)
                    </Text>
                </Box>
            </Box>

            <Box marginTop={1} justifyContent="center">
                <Text color={theme.colors.textDim}>
                    Use ←/→ or A/D to select, Enter to confirm
                </Text>
            </Box>
        </Box>
    );
}
