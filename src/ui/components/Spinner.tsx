import React from "react";
import { Box, Text } from "ink";
import InkSpinner from 'ink-spinner';
import { theme } from "../theme.js";

interface SpinnerProps {
    message?: string;
}

export function Spinner({ message = 'Thinking...' }: SpinnerProps) {
    return (
        <Box paddingLeft={1}>
            <Text color={theme.colors.secondary}>
                <InkSpinner type="dots" />
            </Text>
            <Text color={theme.colors.textMuted}>{message}</Text>
        </Box>
    )
}
