import React, { useEffect, useState } from 'react';
import { Box, Text, useInput } from 'ink';
import InkTextInput from 'ink-text-input';
import { theme } from '../theme.js';
import { useFileSuggestions } from '../hooks/useFileSuggestions.js';
import { FileSuggestionsDropdown } from './FileSuggestionsDropdown.js';


interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (value: string) => void;
    placeholder?: string;
}

export function TextInput({ value, onChange, onSubmit, placeholder }: TextInputProps) {
    const cwd = process.cwd();
    const { suggestions, isActive } = useFileSuggestions(value, cwd);

    const [selectedIndex, setSelectedIndex] = useState(0);
    const [inputKey, setInputKey] = useState(0);

    useEffect(() => {
        setSelectedIndex(0)
    }, [suggestions.length])

    useInput((input, key) => {
        if (!isActive || suggestions.length === 0) return;
        if (key.downArrow) {
            setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
        } else if (key.upArrow) {
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (key.tab) {
            const selected = suggestions[selectedIndex];
            if (selected) {
                const lastAtIndex = value.lastIndexOf('@');
                const newValue = value.slice(0, lastAtIndex + 1) + selected.path + ' ';
                onChange(newValue);
                setInputKey(k => k + 1);
            }
        }
    }, { isActive: isActive && suggestions.length > 0 });

    const handleSubmit = (val: string) => {
        if (isActive && suggestions.length > 0) {
            const selected = suggestions[selectedIndex];
            if (selected) {
                const lastAtIndex = val.lastIndexOf('@');
                const newValue = val.slice(0, lastAtIndex + 1) + selected.path + ' ';
                onChange(newValue);
                setInputKey(k => k + 1);
                return;
            }
        }
        onSubmit(val);
    }

    return (
        <Box flexDirection="column">
            <Box
                borderStyle='round'
                borderColor={theme.colors.primary}
                paddingX={1}
                paddingY={0}
            >
                <Text color={theme.colors.primary}>gloo {'> '}</Text>
                <InkTextInput
                    key={inputKey}
                    value={value}
                    onChange={onChange}
                    onSubmit={handleSubmit}
                    placeholder={placeholder}
                />
            </Box>
            {isActive && (
                <FileSuggestionsDropdown
                    suggestions={suggestions}
                    selectedIndex={selectedIndex}
                />
            )}
        </Box>
    )
}