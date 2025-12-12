import React from 'react';
import { Box, Text } from 'ink';
import InkTextInput from 'ink-text-input';
import { theme } from '../theme.js';


interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    placeholder?: string;
}

export function TextInput({ value, onChange, onSubmit, placeholder }: TextInputProps) {
    return (
        <Box
            borderStyle='round'
            borderColor={theme.colors.primary}
            paddingX={1}
            paddingY={0}
        >
            <Text color={theme.colors.primary}>gloo {'> '}</Text>
            <InkTextInput
                value={value}
                onChange={onChange}
                onSubmit={onSubmit}
                placeholder={placeholder}
            />
        </Box>
    )
}