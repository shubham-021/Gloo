import { TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState, useEffect } from "react";

export interface ModelOption {
    name: string;
    provider: string;
    context: string;
    description: string;
}

interface ModelSelectProps {
    options: ModelOption[];
    selectedIndex: number;
    focused?: boolean;
    indicator?: string;
    indicatorColor?: string;
    onSelect?: (index: number, option: ModelOption) => void;
    onChange?: (index: number, option: ModelOption) => void;
}

export function ModelSelect({
    options,
    selectedIndex,
    focused = false,
    indicator = '>',
    indicatorColor = '#99BB70',
    onSelect,
    onChange,
}: ModelSelectProps) {
    const [focusedIndex, setFocusedIndex] = useState(selectedIndex);

    useEffect(() => {
        setFocusedIndex(selectedIndex);
    }, [selectedIndex]);

    useKeyboard((key) => {
        if (!focused) return;

        if (key.name === 'up' || key.name === 'k') {
            setFocusedIndex(prev => {
                const next = prev > 0 ? prev - 1 : options.length - 1;
                onChange?.(next, options[next]);
                return next;
            });
        }

        if (key.name === 'down' || key.name === 'j') {
            setFocusedIndex(prev => {
                const next = prev < options.length - 1 ? prev + 1 : 0;
                onChange?.(next, options[next]);
                return next;
            });
        }

        if (key.name === 'return') {
            onSelect?.(focusedIndex, options[focusedIndex]);
        }
    });

    return (
        <scrollbox style={{ height: '100%', contentOptions: { flexDirection: 'column', gap: 1 } }} scrollbarOptions={{ width: 0 }}>
            {options.map((option, i) => {
                const isFocused = i === focusedIndex;
                const isSelected = i === selectedIndex;

                return (
                    <box
                        key={option.name}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            gap: 1,
                            padding: 1,
                            backgroundColor: isFocused ? '#1e2a1a' : 'transparent',
                            opacity: 1
                        }}
                    >
                        <text style={{
                            fg: isFocused ? indicatorColor : '#333633',
                            attributes: TextAttributes.BOLD,
                        }}>
                            {isFocused ? indicator : ' '}
                        </text>

                        <box style={{ flexDirection: 'column', gap: 1 }}>
                            <text style={{
                                fg: isFocused ? '#BAD29C' : isSelected ? '#99BB70' : '#B5BAAF',
                                attributes: isFocused ? TextAttributes.BOLD : 0,
                            }}>
                                {option.name}
                                {isSelected ? ' ✓' : ''}
                            </text>
                            <text style={{
                                fg: isFocused ? '#6b7a5e' : '#515A46',
                                attributes: TextAttributes.DIM,
                            }}>
                                {`${option.provider} · ${option.context} · ${option.description}`}
                            </text>
                        </box>
                    </box>
                );
            })}
        </scrollbox>
    );
}
