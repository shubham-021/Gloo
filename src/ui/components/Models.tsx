import { ScrollBoxRenderable, TextAttributes } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState, useRef, useEffect } from "react";
import { getModelsForProvider, getModelMeta, type ModelMeta } from "../../config/index.js";
import type { Providers } from "../../providers/index.js";

interface ModelProps {
    provider: Providers;
    activeModelId: string;
    terminalHeight: number;
    showModelSelect: boolean;
    onSelect: (modelId: string) => void;
    onClose: () => void;
}

export default function ModelBox({ provider, activeModelId, terminalHeight, showModelSelect, onSelect, onClose }: ModelProps) {
    const models = getModelsForProvider(provider);
    const activeIndex = models.findIndex(m => m.id === activeModelId);
    const [focusedIndex, setFocusedIndex] = useState(activeIndex >= 0 ? activeIndex : 0);

    const scrollboxRef = useRef<ScrollBoxRenderable | null>(null);

    useEffect(() => {
        if (scrollboxRef.current) {
            const itemHeight = 3;
            scrollboxRef.current.scrollTo(focusedIndex * itemHeight);
        }
    }, [focusedIndex]);

    useKeyboard((key) => {
        if (!showModelSelect) return;

        if (key.name === 'up' || key.name === 'k') {
            setFocusedIndex(i => i > 0 ? i - 1 : models.length - 1);
        }
        if (key.name === 'down' || key.name === 'j') {
            setFocusedIndex(i => i < models.length - 1 ? i + 1 : 0);
        }
        if (key.name === 'return') {
            onSelect(models[focusedIndex].id);
        }
        if (key.name === 'escape') {
            onClose();
        }
    });

    return (
        <box style={{
            position: 'absolute',
            left: 0, top: 0, right: 0, bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <box style={{
                width: '50%',
                maxHeight: Math.min(terminalHeight - 6, 20),
                border: true,
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                backgroundColor: '#151613',
                flexDirection: 'column',
                padding: 1,
            }}>
                <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingX: 1 }}>
                    <text style={{ fg: '#BAD29C', attributes: TextAttributes.BOLD }}>Select Model</text>
                    <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to close</text>
                </box>

                <scrollbox ref={scrollboxRef} style={{ marginTop: 1, contentOptions: { flexDirection: 'column' } }}>
                    {models.map((model, i) => {
                        const isFocused = i === focusedIndex;
                        const isActive = model.id === activeModelId;

                        return (
                            <box key={model.id} style={{
                                flexDirection: 'row',
                                alignItems: 'flex-start',
                                gap: 1,
                                padding: 1,
                                backgroundColor: isFocused ? '#1e2a1a' : 'transparent',
                            }}>
                                <text style={{
                                    fg: isFocused ? '#99BB70' : '#333633',
                                    attributes: TextAttributes.BOLD,
                                }}>
                                    {isFocused ? '>' : ' '}
                                </text>
                                <box style={{ flexDirection: 'column' }}>
                                    <text style={{
                                        fg: isFocused ? '#BAD29C' : isActive ? '#99BB70' : '#B5BAAF',
                                        attributes: isFocused ? TextAttributes.BOLD : 0,
                                    }}>
                                        {model.label}
                                        {isActive ? ' ✓' : ''}
                                    </text>
                                    <text style={{
                                        fg: isFocused ? '#6b7a5e' : '#515A46',
                                        attributes: TextAttributes.DIM,
                                    }}>
                                        {`${(model.contextWindow / 1000)}K · ${model.description}`}
                                    </text>
                                </box>
                            </box>
                        );
                    })}
                </scrollbox>
            </box>
        </box>
    );
}
