import React, { memo } from 'react';
import { ScrollBoxRenderable, TextAttributes } from '@opentui/core';
import { Chats } from '../../types';

interface MessageProps {
  chatMessages: Chats[],
  scrollBoxRef: React.RefObject<ScrollBoxRenderable | null>;
  displayText: string;
  displayThinkingText: string;
  queuedMessages: string[];
}

export const Message = memo(function Message({ chatMessages, scrollBoxRef, displayText, displayThinkingText, queuedMessages }: MessageProps) {

  return (
    <box style={{ flexGrow: 1, paddingTop: 1 }}>
      <scrollbox ref={scrollBoxRef} style={{ height: '100%', contentOptions: { flexDirection: 'column', gap: 1 } }} scrollbarOptions={{ width: 0 }} viewportCulling stickyScroll stickyStart='bottom'>
        {chatMessages.map((c, index) => {
          // if (c.role === 'tool_request') {
          //   return <ToolApprovalPrompt key={`tool-${index}`} message={c} terminalWidth={terminalWidth} />;
          // }

          if (c.role === 'user') {
            return (
              <box key={`${c.role}-${c.content.slice(4)}`} style={{
                border: ['left'],
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                flexDirection: 'row',
                paddingX: 1,
                gap: 1,
                height: 3,
                minHeight: 3,
                alignItems: 'center',
                backgroundColor: '#151613'
              }}>
                <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>{'>'}</text>
                <text style={{}}>{c.content}</text>
              </box>
            )
          }

          if (c.role === 'thinking') {
            return (
              <box style={{
                flexDirection: 'row',
                paddingX: 1,
                alignItems: 'center',
              }}>
                <text style={{ attributes: TextAttributes.DIM, flexDirection: 'row' }}>
                  <span style={{ fg: '#99BB70', attributes: TextAttributes.DIM | TextAttributes.BOLD }}>Thinking: </span>
                  <span attributes={TextAttributes.ITALIC}>{c.content}</span>
                </text>
              </box>
            )
          }

          return (
            <box style={{
              flexDirection: 'column',
              paddingX: 1,
            }}>
              <text style={{}}>{c.content}</text>
            </box>
          )
        })}

        {(displayThinkingText) && (
          <box key={`thinking-${displayThinkingText.slice(3)}`} style={{
            flexDirection: 'row',
            paddingX: 1,
            alignItems: 'center',
          }}>
            <text style={{ attributes: TextAttributes.DIM, flexDirection: 'row' }}>
              <span style={{ fg: '#99BB70', attributes: TextAttributes.DIM | TextAttributes.BOLD }}>Thinking: </span>
              <span attributes={TextAttributes.ITALIC}>{displayThinkingText}</span>
            </text>
          </box>
        )}

        {(displayText) && (
          <box style={{
            flexDirection: 'column',
            paddingX: 1,
          }}>
            <text style={{}}>{displayText}</text>
          </box>
        )}

        {queuedMessages.map((msg, i) => (
          <box key={`queued-${i}`} style={{
            border: ['left'],
            borderStyle: 'rounded',
            borderColor: '#515A46',
            flexDirection: 'row',
            paddingX: 1,
            gap: 1,
            height: 3,
            minHeight: 3,
            alignItems: 'center',
            backgroundColor: '#151613',
          }}>
            <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>{'◦'}</text>
            <text style={{ attributes: TextAttributes.DIM }}>{msg}</text>
            <text style={{ fg: '#515A46', attributes: TextAttributes.DIM | TextAttributes.ITALIC }}>{' queued'}</text>
          </box>
        ))}
      </scrollbox>
    </box>
  );
});