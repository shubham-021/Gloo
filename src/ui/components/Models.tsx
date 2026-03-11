import { TextAttributes } from "@opentui/core";

interface Model {
    name: string;
    provider: string;
    context: string;
    description: string;
}

export const MODELS: Model[] = [
    { name: 'Claude Opus 4', provider: 'Anthropic', context: '200K', description: 'Most capable, best for complex reasoning' },
    { name: 'Claude Sonnet 4', provider: 'Anthropic', context: '200K', description: 'Balanced speed and intelligence' },
    { name: 'GPT-4o', provider: 'OpenAI', context: '128K', description: 'Fast multimodal model' },
    { name: 'GPT-o3', provider: 'OpenAI', context: '200K', description: 'Advanced reasoning with thinking' },
    { name: 'Gemini 2.5 Pro', provider: 'Google', context: '1M', description: 'Large context, strong coding' },
    { name: 'Llama 4 Maverick', provider: 'Meta', context: '1M', description: 'Open-source, strong performance' },
];

interface ModelProps {
    selectedModelIndex: number;
    setSelectedModelIndex: (index: number) => void;
    terminalHeight: number;
    showModelSelect: boolean;
    setShowModelSelect: (show: boolean) => void;
}

export default function ModelBox({ selectedModelIndex, setSelectedModelIndex, terminalHeight, showModelSelect, setShowModelSelect }: ModelProps) {
    return (
        <box style={{
            position: 'absolute',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <box style={{
                width: '80%',
                border: true,
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                backgroundColor: '#151613',
                flexDirection: 'column',
                opacity: 1,
                padding: 1,
            }}>
                <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingX: 1 }}>
                    <text style={{ fg: '#BAD29C', attributes: TextAttributes.BOLD }}>Select Model</text>
                    <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc or ctrl+m to close</text>
                </box>

                <box style={{ marginTop: 1 }}>
                    <select
                        itemSpacing={1}
                        options={MODELS.map(m => ({
                            name: m.name,
                            description: `${m.provider} · ${m.context} · ${m.description}`,
                            value: m.name,
                        }))}
                        selectedIndex={selectedModelIndex}
                        onSelect={(index) => {
                            setSelectedModelIndex(index);
                            setShowModelSelect(false);
                        }}
                        focused={showModelSelect}
                        height={terminalHeight > 24 ? MODELS.length * 3 + 1 : '100%'}
                        showScrollIndicator={false}
                        textColor="#ffffff"
                        selectedBackgroundColor="transparent"
                        focusedBackgroundColor="#151613"
                        selectedTextColor="#6b7a5e"
                        descriptionColor="#ffffff"
                        selectedDescriptionColor="#6b7a5e"
                    />
                </box>
            </box>
        </box>
    );
}