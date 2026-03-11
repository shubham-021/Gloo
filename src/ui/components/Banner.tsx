import { memo } from 'react';

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

export const Banner = memo(function Banner({ terminalWidth, selectedModelIndex, config_name }: { terminalWidth: number, selectedModelIndex: number, config_name: string }) {
  return (
    <box style={{
      width: '100%',
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingX: 1,
      paddingY: 0,
      flexShrink: 0,
    }}>
      <ascii-font text="Gloo" flexShrink={0} alignItems='center' color={'#BAD29C'} font='tiny' />
      {/* <text style={{ flexDirection: 'row', alignItems: 'center', fg: '#BAD29C' }}>
          Gloo
        </text> */}
      {terminalWidth > 70 && (
        <box style={{
          flexShrink: 0,
          flexGrow: 1,
          gap: 2,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingX: 1
        }}>
          <text style={{ fg: '#B5BAAF' }}>config_name</text>
          <text style={{ fg: '#B5BAAF' }}>{''}</text>
          <text style={{ fg: '#B5BAAF' }}>{MODELS[selectedModelIndex].name}</text>
        </box>
      )}
    </box>
  )
});