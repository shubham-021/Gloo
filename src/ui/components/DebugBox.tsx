import React from 'react';
import { Box, Text } from 'ink';
import { theme } from '../theme.js';

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
        <Box
            flexDirection="column"
            borderStyle="round"
            borderColor={getBorderColor()}
            paddingX={1}
            marginY={1}
        >
            <Box gap={1}>
                <Text color={getBorderColor()}>{getIcon()}</Text>
                <Text color={getBorderColor()} bold>{title}</Text>
            </Box>
            <Box paddingLeft={2} marginTop={1}>
                <Text color={theme.colors.textMuted}>{message}</Text>
            </Box>
            {details && (
                <Box paddingLeft={2} marginTop={1}>
                    <Text color={theme.colors.textDim} dimColor>{details}</Text>
                </Box>
            )}
        </Box>
    );
}
