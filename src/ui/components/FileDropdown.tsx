import { TextAttributes } from "@opentui/core";
import { FileSuggestion } from "../hooks/useFileSuggestions";

interface Props {
  suggestions: FileSuggestion[];
  selectedIndex: number;
  inputHeight?: number;
}

export function FileDropdown({ suggestions, selectedIndex, inputHeight }: Props) {
  if (suggestions.length === 0) return null;

  return (
    <box style={{
      // position: 'absolute',
      // top: inputHeight,
      // left: 0,
      // right: 0,
      flexDirection: 'column',
      border: ['left', 'top', 'right'],
      borderStyle: 'rounded',
      borderColor: '#99BB70',
      paddingX: 1,
      paddingY: 0,
      backgroundColor: '#151613'
    }}>
      {suggestions.map((s, i) => {
        const isSelected = i === selectedIndex;
        return (
          <text
            key={s.path}
            style={{
              fg: isSelected ? '#BAD29C' : '#B5BAAF',
              attributes: isSelected ? TextAttributes.BOLD : TextAttributes.NONE
            }}
          >
            {isSelected ? '> ' : '  '}{s.display}
          </text>
        );
      })}
    </box>
  );
}
