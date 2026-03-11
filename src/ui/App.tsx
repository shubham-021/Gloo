import React, { useState, useCallback, useEffect, useRef } from 'react';
import Conf from 'conf';
import { useRenderer, useOnResize, useKeyboard, createRoot } from '@opentui/react';
import { Banner, Loader, Message, TextInput } from './components/index.js';
import LLMCore from '../core.js';
import { Config, AgentMode, Chats } from '../types.js';
import { parseFileAttachment, parseFileMentions } from '../utils/fileAttachment.js';
import { createCliRenderer, ScrollBoxRenderable, TextareaRenderable } from '@opentui/core';
import ModelBox from './components/Models.js';
import { CommandPalette } from './components/CommandPalette.js';

const config = new Conf({ projectName: 'gloo-cli' });
const MAX_CHAT_ITEMS = 100;

// const addChatItem = (prev: ChatItem[], ...items: ChatItem[]): ChatItem[] => {
//     const newItems = [...prev, ...items];
//     return newItems.length > MAX_CHAT_ITEMS ? newItems.slice(-MAX_CHAT_ITEMS) : newItems;
// };

let itemIdCounter = 0;

function App() {
    const renderer = useRenderer();

    const [terminalWidth, setTerminalWidth] = useState(renderer.terminalWidth);
    const [terminalHeight, setTerminalHeight] = useState(renderer.terminalHeight);

    useOnResize((w, h) => {
        setTerminalWidth(w);
        setTerminalHeight(h);
        console.log(`Current W x H : ${w} x ${h}`)
    })

    const [input, setInput] = useState('');
    const [chatItems, setChatItems] = useState<Chats[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTool, setCurrentTool] = useState<string | null>(null);

    const [showModelSelect, setShowModelSelect] = useState(false);
    const [selectedModelIndex, setSelectedModelIndex] = useState(0);
    const [showHelp, setShowHelp] = useState(false);
    const [leaderActive, setLeaderActive] = useState(false);

    const textareaRef = useRef<TextareaRenderable | null>(null)
    const scrollBoxRef = useRef<ScrollBoxRenderable | null>(null)

    const [mode, setMode] = useState<AgentMode>(AgentMode.CHAT);

    const [pendingApproval, setPendingApproval] = useState<{
        toolName: string;
        args: Record<string, any>;
        resolve: (approved: boolean) => void;
    } | null>(null);
    const [showSettings, setShowSettings] = useState(false);
    const [configVersion, setConfigVersion] = useState(0);

    const [displayText, setDisplayText] = useState('');
    const [thinkingEnabled, setThinkingEnabled] = useState(false);
    const [displayThinking, setDisplayThinking] = useState('');

    const abortControllerRef = useRef<AbortController | null>(null);

    const defaultConfig = config.get('default') as string | undefined;
    const currentConfig = defaultConfig ? config.get(defaultConfig) as Config : undefined;

    const handleSubmit = async () => {
        if (textareaRef.current) {
            const content = textareaRef.current.plainText;
            const input = content.trim();
            if (input) {
                switch (input) {
                    case ':q': renderer.destroy(); process.exit(0);
                        break;

                    case '/console': renderer.console.toggle(); textareaRef.current.clear();
                        break;

                    case '/model': setShowModelSelect(prev => !prev); textareaRef.current.clear();
                        break;

                    case '/help': setShowHelp(prev => !prev); textareaRef.current.clear();
                        break;

                    case '/clear': setChatItems([]);
                        break;

                    default: {
                        const pureAttachment = parseFileAttachment(input);
                        const cwd = process.cwd();

                        const { attachments: mentionedFiles } = parseFileMentions(input, cwd);
                        if (!currentConfig?.api || !currentConfig?.search_api) {
                            // give toast to let user know about config
                            textareaRef.current.replaceText('config not set');
                            return;
                        }

                        let userMessage = input;
                        let displayMessage = input;
                        if (pureAttachment) {
                            displayMessage = pureAttachment.name;
                            userMessage = pureAttachment.isImage ? `[Attached image: ${pureAttachment.name}\n(base64:${pureAttachment.content})]` : `${pureAttachment.name}\n\n[Referenced file: ${pureAttachment.path}]`;
                        } else if (mentionedFiles.length > 0) {
                            const filePath = mentionedFiles.map(f => f.path).join(', ');
                            userMessage = `${input}\n\n[Referenced files: ${filePath}]`;
                        }

                        setChatItems(prev => [...prev, { role: 'user', content: displayMessage }]);
                        textareaRef.current.clear();
                        setIsLoading(true);
                        setDisplayText('');
                        setError(null);
                        if (textareaRef.current) textareaRef.current.blur();

                        abortControllerRef.current = new AbortController();
                        const signal = abortControllerRef.current.signal;

                        try {
                            const llm = new LLMCore(currentConfig.provider, currentConfig.model, currentConfig.api, currentConfig.search_api);
                            llm.setMode(mode);

                            let fullResponse = '';
                            let fullThinking = '';
                            for await (const event of llm.chat(userMessage, signal)) {
                                if (event.type === 'text') {
                                    setCurrentTool(null);
                                    fullResponse += event.content;
                                    setDisplayText(fullResponse);
                                } else if (event.type === 'thinking') {
                                    fullThinking += event.content;
                                    setDisplayThinking(fullThinking);
                                } else if (event.type === 'tool') {
                                    setCurrentTool(event.message);
                                } else if (event.type === 'debug') {
                                    // 
                                } else if (event.type === 'approval') {
                                    setPendingApproval({
                                        toolName: event.toolName,
                                        args: event.args,
                                        resolve: event.resolve
                                    })
                                }
                            }

                            if (fullThinking) {
                                setChatItems(prev => [...prev, { role: 'thinking', content: fullThinking }]);
                            }
                            setChatItems(prev => [...prev, { role: 'response', content: fullResponse }]);
                            setDisplayText('');
                            setDisplayThinking('');
                        } catch (err) {
                            if ((err as Error).name === 'AbortError') return;
                            if (process.env.GLOO_DEBUG === 'true') {
                                // debug
                            }
                            setError((err as Error).message);
                        } finally {
                            setIsLoading(false);
                            setCurrentTool(null);
                            setDisplayText('');
                            setDisplayThinking('');
                            if (textareaRef.current) textareaRef.current.focus();
                        }
                    }
                }
            }
        }
    }

    const handleSettingsClose = () => {
        setShowSettings(false);
    };

    const handleConfigChange = () => {
        setConfigVersion(v => v + 1);
    };

    useKeyboard((key) => {
        // if (hasPendingTool) {
        //     if (key.name === 'y' || key.name === 'n' || (key.shift && (key.name === 'Y' || key.name === 'N') || key.name === 'Y' || key.name === 'N')) {
        //         const isAccept = key.name.toLowerCase() === 'y';
        //         setChatMessages(prev => {
        //             const index = prev.findIndex(c => c.role === 'tool_request' && c.toolStatus === 'pending');
        //             if (index !== -1) {
        //                 const newMessages = [...prev];
        //                 newMessages[index] = {
        //                     ...newMessages[index],
        //                     toolStatus: isAccept ? 'accepted' : 'denied'
        //                 };
        //                 return newMessages;
        //             }
        //             return prev;
        //         });
        //         return;
        //     }
        // }
        if (key.name === 'tab') {
            setThinkingEnabled(prev => !prev);
            return;
        }

        if (key.name === 'escape' && isLoading && abortControllerRef.current) {
            abortControllerRef.current.abort();
            return;
        }

        if (key.ctrl && key.name === 'g') {
            setLeaderActive(true);
            textareaRef.current?.blur();
            return;
        }

        if (leaderActive) {
            setLeaderActive(false);

            if (key.name === 'm') {
                setShowModelSelect(prev => !prev);
            }

            if (key.name === 'c') {
                renderer.console.toggle();
            }

            if (key.name === 'h') {
                setShowHelp(prev => !prev);
            }
        }

        if (showModelSelect && key.name === 'escape') {
            setShowModelSelect(false);
        }

        if (showHelp && key.name === 'escape') {
            setShowHelp(false);
        }

        if (!showHelp && !showModelSelect && textareaRef.current && key.ctrl && key.name === 'k') {
            textareaRef.current.focus();
        }
    })


    // if (key.escape && isLoading) {
    //     abortControllerRef.current?.abort();
    //     setIsLoading(false);
    //     setCurrentTool(null);
    //     setDisplayText('');
    //     setChatItems(prev => addChatItem(prev, {
    //         type: 'message',
    //         id: ++itemIdCounter,
    //         role: 'assistant',
    //         content: '[Cancelled]'
    //     }));
    // }

    return (
        <box style={{ width: '100%', height: '100%', flexDirection: 'column', paddingY: 1, position: 'relative' }}>
            <Banner terminalWidth={terminalWidth} selectedModelIndex={selectedModelIndex} config_name={currentConfig?.model ?? 'Not found'} />
            <Message chatMessages={chatItems} scrollBoxRef={scrollBoxRef} displayText={displayText} displayThinkingText={displayThinking} />

            <box style={{ flexDirection: 'column', flexShrink: 0 }}>
                <TextInput textareaRef={textareaRef} handleSubmit={handleSubmit} />
            </box>

            {isLoading && (
                <box style={{ flexShrink: 0, flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                    <Loader />
                    <text>{''}</text>
                    <text><span fg={'#99BB70'}>esc</span> to cancel</text>
                </box>
            )}

            {showModelSelect && (
                <ModelBox
                    selectedModelIndex={selectedModelIndex}
                    setSelectedModelIndex={setSelectedModelIndex}
                    terminalHeight={terminalHeight}
                    showModelSelect
                    setShowModelSelect={setShowModelSelect}
                />
            )}

            {showHelp && (
                <CommandPalette onClose={() => setShowHelp(false)} />
            )}
        </box>
    )
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);