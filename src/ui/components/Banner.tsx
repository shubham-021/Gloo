import { memo } from 'react';
import { TextAttributes } from '@opentui/core';
import type { ResolvedConfig } from '../../config/index.js';
import { getModelMeta } from '../../config/index.js';

interface BannerProps {
  terminalWidth: number;
  resolvedConfig: ResolvedConfig | null;
}

export const Banner = memo(function Banner({ terminalWidth, resolvedConfig }: BannerProps) {
  const modelMeta = resolvedConfig ? getModelMeta(resolvedConfig.model) : null;

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

      {terminalWidth > 70 && resolvedConfig && (
        <box style={{
          flexShrink: 0,
          flexGrow: 1,
          gap: 2,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingX: 1,
        }}>
          <text style={{ fg: '#515A46' }}>{resolvedConfig.profileName}</text>
          <text style={{ fg: '#B5BAAF' }}>
            {modelMeta?.label ?? resolvedConfig.model}
            <span fg='#515A46' attributes={TextAttributes.DIM}>
              {modelMeta ? ` · ${(modelMeta.contextWindow / 1000)}K` : ''}
            </span>
          </text>
        </box>
      )}
    </box>
  );
});
