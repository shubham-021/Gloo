import { TextareaRenderable } from "@opentui/core"
import { memo, useEffect, useMemo, useState } from "react";
import { useFileSuggestions } from "../hooks/useFileSuggestions";
import { useKeyboard } from "@opentui/react";
import { FileDropdown } from "./FileDropdown";

interface TextInputProps {
    textareaRef: React.RefObject<TextareaRenderable | null>;
    handleSubmit: () => void;
}

export const TextInput = memo(({ textareaRef, handleSubmit }: TextInputProps) => {

    const [input, setInput] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const cwd = process.cwd();
    const { suggestions, isActive, setIsActive } = useFileSuggestions(input, cwd);

    useEffect(() => {
        setSelectedIndex(0);
    }, [suggestions.length])

    useKeyboard((key) => {
        if (isActive && suggestions.length !== 0 && textareaRef.current) {
            if (key.name === 'down') {
                setSelectedIndex(i => Math.min(i + 1, suggestions.length - 1));
            } else if (key.name === 'up') {
                setSelectedIndex(i => Math.max(i - 1, 0))
            } else if (key.name === 'tab') {
                const selected = suggestions[selectedIndex];
                if (selected) {
                    const value = textareaRef.current.plainText;
                    const lastAtIndex = value.lastIndexOf('@');
                    const newValue = value.slice(0, lastAtIndex + 1) + selected.path + ' ';
                    textareaRef.current.replaceText(newValue);
                    setIsActive(false);
                    textareaRef.current.gotoLineEnd();
                    textareaRef.current.focus();
                }
            } else if (key.name === 'escape') {
                setIsActive(false);
                textareaRef.current.focus();
            }
        }
    })

    return (
        <box flexDirection={'column'}>
            {isActive && (
                <FileDropdown suggestions={suggestions} selectedIndex={selectedIndex} inputHeight={textareaRef.current?.height} />
            )}
            <box style={{
                border: true,
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                flexDirection: 'row',
                gap: 1,
                paddingX: 1,
                // position: 'relative'
            }}>
                <text fg={'#99BB70'} flexShrink={0}>{'>'}</text>
                <textarea
                    ref={textareaRef}
                    width='100%'
                    placeholder="Type your query here or /help for commands"
                    placeholderColor='#515A46'
                    focused
                    style={{ paddingX: 1 }}
                    onSubmit={handleSubmit}
                    onContentChange={() => setInput(textareaRef.current?.plainText ?? '')}
                    // onContentChange={(e) => console.log(JSON.stringify(e))}
                    keyBindings={[{ name: 'return', action: 'submit' }, { name: 'return', shift: true, action: 'newline' }]}
                />
            </box>
        </box>
    )
});

export default TextInput;