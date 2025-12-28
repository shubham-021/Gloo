import React from "react";
import { Box, Text } from "ink";
import { theme, Theme } from "../theme.js";
import { FileSuggestion } from "../hooks/useFileSuggestions.js";

interface Props {
    suggestions: FileSuggestion[];
    selectedIndex: number;
}

export function FileSuggestionsDropdown({ suggestions, selectedIndex }: Props) {
    if (suggestions.length === 0) return null;

    return (
        <Box
            flexDirection="column"
            marginLeft={7}
            borderStyle="single"
            borderColor={theme.colors.textDim}
            paddingX={1}
        >
            {suggestions.map((s, i) => (
                <Text
                    key={s.path}
                    color={i === selectedIndex ? theme.colors.primary : theme.colors.textMuted}
                    bold={i === selectedIndex}
                >
                    {i === selectedIndex ? '› ' : '  '}{s.display}
                </Text>
            ))}
        </Box>
    )
}