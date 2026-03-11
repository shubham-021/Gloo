import React from 'react';
import { theme } from '../theme.js';
import { TextAttributes } from '@opentui/core';

interface DebugBoxProps {
    type: 'error' | 'warning' | 'info';
    title: string;
    message: string;
    details?: string;
}

export function DebugBox({ type, title, message, details }: DebugBoxProps) {
    const getBorderColor = () => {
        switch (type) {
            case 'error': return theme.colors.error;
            case 'warning': return theme.colors.warning;
            case 'info': return theme.colors.debug;
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error': return theme.icons.error;
            case 'warning': return theme.icons.warning;
            case 'info': return theme.icons.debug;
        }
    };

    return (
        <box
            flexDirection="column"
            borderStyle='rounded'
            borderColor={getBorderColor()}
            paddingX={1}
            marginY={1}
        >
            <box gap={1}>
                <text fg={getBorderColor()}>{getIcon()}</text>
                <text fg={getBorderColor()} attributes={TextAttributes.BOLD}>{title}</text>
            </box>
            <box paddingLeft={2} marginTop={1}>
                <text fg={theme.colors.textMuted}>{message}</text>
            </box>
            {details && (
                <box paddingLeft={2} marginTop={1}>
                    <text fg={theme.colors.textDim} attributes={TextAttributes.DIM}>{details}</text>
                </box>
            )}
        </box>
    );
}
