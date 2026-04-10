import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useRenderer, useOnResize, useKeyboard, createRoot } from '@opentui/react';
import { Banner, Loader, Message, TextInput } from './components/index.js';
import LLMCore from '../core.js';
import { AgentMode, Chats } from '../types.js';
import { parseFileAttachment, parseFileMentions } from '../utils/fileAttachment.js';
import { createCliRenderer, ScrollBoxRenderable, TextareaRenderable } from '@opentui/core';
import { Settings } from './components/Settings.js';
import { WelcomeScreen } from './components/WelcomeScreen.js';
import { CommandPalette } from './components/CommandPalette.js';
import { configManager, getModelsForProvider, type ResolvedConfig } from '../config/index.js';
import ModelBox from './components/Models.js';
import { HomeScreen } from './components/HomeScreen.js';
import { StatusBar } from './components/index.js';
import { getModelMeta } from '../config/index.js';

function App() {
    const renderer = useRenderer();

    const [terminalWidth, setTerminalWidth] = useState(renderer.terminalWidth);
    const [terminalHeight, setTerminalHeight] = useState(renderer.terminalHeight);

    useOnResize((w, h) => {
        setTerminalWidth(w);
        setTerminalHeight(h);
    })

    const messageQueueRef = useRef<{ userMessage: string; displayMessage: string }[]>([]);
    const [queuedDisplayMessages, setQueueDisplayMessage] = useState<string[]>([]);

    const isLoadingRef = useRef(false);

    const [chatItems, setChatItems] = useState<Chats[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentTool, setCurrentTool] = useState<string | null>(null);

    const [showHelp, setShowHelp] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [leaderActive, setLeaderActive] = useState(false);

    const textareaRef = useRef<TextareaRenderable | null>(null);
    const scrollBoxRef = useRef<ScrollBoxRenderable | null>(null);

    const [mode, setMode] = useState<AgentMode>(AgentMode.CHAT);
    const [showModelSelect, setShowModelSelect] = useState(false);

    const [pendingApproval, setPendingApproval] = useState<{
        toolName: string;
        args: Record<string, any>;
        resolve: (approved: boolean) => void;
    } | null>(null);

    const [displayText, setDisplayText] = useState('');
    const [thinkingEnabled, setThinkingEnabled] = useState(false);
    const [displayThinking, setDisplayThinking] = useState('');

    const abortControllerRef = useRef<AbortController | null>(null);

    const [configVersion, setConfigVersion] = useState(0);
    const resolved = configManager.resolve();
    const isConfigured = resolved !== null;

    const handleConfigChange = () => {
        setConfigVersion(v => v + 1);
    };

    const processMessage = async (userMessage: string) => {

        if (!resolved) return;

        setIsLoading(true);
        isLoadingRef.current = true;
        setDisplayText('');
        setError(null);
        if (textareaRef.current) textareaRef.current.blur();

        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;

        try {
            const llm = new LLMCore(
                resolved.provider,
                resolved.model,
                resolved.apiKey,
                resolved.searchApi ?? ''
            );
            llm.setMode(mode);

            let fullResponse = '';
            let fullThinking = '';
            for await (const event of llm.chat(userMessage, signal, thinkingEnabled)) {
                if (event.type === 'text') {
                    setCurrentTool(null);
                    fullResponse += event.content;
                    setDisplayText(fullResponse);
                } else if (event.type === 'thinking') {
                    fullThinking += event.content;
                    setDisplayThinking(fullThinking);
                } else if (event.type === 'tool') {
                    setCurrentTool(event.message);
                } else if (event.type === 'approval') {
                    setPendingApproval({
                        toolName: event.toolName,
                        args: event.args,
                        resolve: event.resolve
                    });
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
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
            setCurrentTool(null);
            setDisplayText('');
            setDisplayThinking('');

            const next = messageQueueRef.current.shift();
            if (next) {
                setQueueDisplayMessage(prev => prev.slice(1));
                setChatItems(prev => [...prev, { role: 'user', content: next.displayMessage }]);
                processMessage(next.userMessage);
            } else {
                if (textareaRef.current) textareaRef.current.focus();
            }
        }
    }

    const handleSubmit = async () => {
        if (textareaRef.current) {
            const content = textareaRef.current.plainText;
            const input = content.trim();
            if (input) {
                switch (input) {
                    case ':q': renderer.destroy(); process.exit(0);
                        break;

                    case '/console': renderer.console.toggle(); textareaRef.current.blur(); textareaRef.current.clear();
                        break;

                    case '/help': setShowHelp(prev => !prev); textareaRef.current.blur(); textareaRef.current.clear();
                        break;

                    case '/settings': setShowSettings(true); textareaRef.current.blur(); textareaRef.current.clear();
                        break;

                    case '/model': setShowModelSelect(true); textareaRef.current.blur(); textareaRef.current.clear();
                        break;

                    case '/clear': setChatItems([]); textareaRef.current.clear();
                        break;

                    default: {
                        if (!resolved) {
                            textareaRef.current.replaceText('Config not set. Press Ctrl+G → S to open settings.');
                            return;
                        }

                        const pureAttachment = parseFileAttachment(input);
                        const cwd = process.cwd();
                        const { attachments: mentionedFiles } = parseFileMentions(input, cwd);

                        let userMessage = input;
                        let displayMessage = input;
                        if (pureAttachment) {
                            displayMessage = pureAttachment.name;
                            userMessage = pureAttachment.isImage
                                ? `[Attached image: ${pureAttachment.name}\n(base64:${pureAttachment.content})]`
                                : `${pureAttachment.name}\n\n[Referenced file: ${pureAttachment.path}]`;
                        } else if (mentionedFiles.length > 0) {
                            const filePath = mentionedFiles.map(f => f.path).join(', ');
                            userMessage = `${input}\n\n[Referenced files: ${filePath}]`;
                        }

                        if (isLoadingRef.current) {
                            messageQueueRef.current.push({ userMessage, displayMessage });
                            setQueueDisplayMessage(prev => [...prev, displayMessage]);
                        } else {
                            setChatItems(prev => [...prev, { role: 'user', content: displayMessage }]);
                            processMessage(userMessage);
                        }

                        if (textareaRef.current) textareaRef.current.clear();
                    }
                }
            }
        }
    }

    const hasOverlay = showHelp || showSettings || showModelSelect;

    useKeyboard((key) => {
        if (key.name === 'escape') {
            if (showHelp) {
                setShowHelp(false);
                if (textareaRef.current) textareaRef.current.focus();
                return;
            }

            if (showModelSelect) {
                setShowModelSelect(false);
                if (textareaRef.current) textareaRef.current.focus();
                return;
            }

            if (isLoading && abortControllerRef.current) {
                abortControllerRef.current.abort();
                if (textareaRef.current) textareaRef.current.focus();
                return;
            }
        }

        if (hasOverlay) return; // let overlay handle its own keys

        if (key.name === 'tab') {
            setMode(prev => {
                const modes = [AgentMode.CHAT, AgentMode.BUILD, AgentMode.PLAN];
                const nextIndex = (modes.indexOf(prev) + 1) % modes.length;
                return modes[nextIndex];
            });
            return;
        }

        // if (key.name === 'escape' && isLoading && abortControllerRef.current) {
        //     abortControllerRef.current.abort();
        //     return;
        // }

        if (key.ctrl && key.name === 't') {
            const meta = resolved ? getModelMeta(resolved.model) : null;
            if (meta?.supportsThinking) {
                setThinkingEnabled(prev => !prev);
            }
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
                if (showModelSelect && textareaRef.current) textareaRef.current.blur();
            }
            if (key.name === 'c') {
                renderer.console.toggle();
            }
            if (key.name === 'h') {
                setShowHelp(prev => !prev);
                if (showHelp && textareaRef.current) textareaRef.current.blur();
            }
            if (key.name === 's') {
                setShowSettings(true);
                if (showSettings && textareaRef.current) textareaRef.current.blur();
            }
        }

        // Welcome screen: 's' opens settings directly
        if (!isConfigured && key.name === 's') {
            setShowSettings(true);
            return;
        }

        if (!hasOverlay && textareaRef.current && key.ctrl && key.name === 'k') {
            textareaRef.current.focus();
        }
    });

    // ── Render ──

    if (!isConfigured && !showSettings) {
        return (
            <box style={{ width: '100%', height: '100%', flexDirection: 'column', paddingY: 1, position: 'relative' }}>
                <Banner terminalWidth={terminalWidth} resolvedConfig={null} />
                <WelcomeScreen />
                {showSettings && (
                    <Settings
                        onClose={() => setShowSettings(false)}
                        onConfigChange={handleConfigChange}
                    />
                )}
            </box>
        );
    }

    const isHome = chatItems.length === 0 && !isLoading;

    if (isHome) {
        return (
            <box style={{ width: '100%', height: '100%', flexDirection: 'column', paddingY: 1, position: 'relative' }}>
                <HomeScreen resolvedConfig={resolved!} terminalWidth={terminalWidth}>
                    <TextInput textareaRef={textareaRef} handleSubmit={handleSubmit} />
                    <StatusBar
                        mode={mode}
                        thinkingEnabled={thinkingEnabled}
                        thinkingSupported={
                            resolved ? (getModelMeta(resolved.model)?.supportsThinking ?? false) : false
                        }
                        onModeChange={setMode}
                        onThinkingToggle={() => setThinkingEnabled(prev => !prev)}
                    />
                </HomeScreen>

                {showHelp && (
                    <CommandPalette onClose={() => setShowHelp(false)} />
                )}

                {showSettings && (
                    <Settings
                        onClose={() => setShowSettings(false)}
                        onConfigChange={handleConfigChange}
                    />
                )}

                {showModelSelect && resolved && (
                    <ModelBox
                        provider={resolved.provider}
                        activeModelId={resolved.model}
                        terminalHeight={terminalHeight}
                        showModelSelect={showModelSelect}
                        onSelect={(modelId) => {
                            configManager.setActiveModel(modelId);
                            handleConfigChange();
                            setShowModelSelect(false);
                        }}
                        onClose={() => setShowModelSelect(false)}
                    />
                )}
            </box>
        )
    }

    return (
        <box style={{ width: '100%', height: '100%', flexDirection: 'column', paddingY: 1, position: 'relative' }}>
            <Banner terminalWidth={terminalWidth} resolvedConfig={resolved} />

            {resolved && resolved.searchApiSource === 'none' && (
                <box style={{ paddingX: 2, paddingY: 1, flexShrink: 0 }}>
                    <text style={{ fg: '#515A46' }}>
                        {'⚠ Web search unavailable — add a search API in '}
                        <span fg='#99BB70'>settings</span>
                        {' for best results'}
                    </text>
                </box>
            )}

            <Message chatMessages={chatItems} scrollBoxRef={scrollBoxRef} displayText={displayText} displayThinkingText={displayThinking} queuedMessages={queuedDisplayMessages} />

            <box style={{ flexDirection: 'column', flexShrink: 0 }}>
                <TextInput textareaRef={textareaRef} handleSubmit={handleSubmit} />
            </box>

            <StatusBar
                mode={mode}
                thinkingEnabled={thinkingEnabled}
                thinkingSupported={
                    resolved ? (getModelMeta(resolved.model)?.supportsThinking ?? false) : false
                }
                onModeChange={setMode}
                onThinkingToggle={() => setThinkingEnabled(prev => !prev)}
            />

            {isLoading && (
                <box style={{ flexShrink: 0, flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                    <Loader />
                    <text>{''}</text>
                    <text><span fg={'#99BB70'}>esc</span> to cancel</text>
                </box>
            )}

            {showHelp && (
                <CommandPalette onClose={() => setShowHelp(false)} />
            )}

            {showSettings && (
                <Settings
                    onClose={() => setShowSettings(false)}
                    onConfigChange={handleConfigChange}
                />
            )}

            {showModelSelect && resolved && (
                <ModelBox
                    provider={resolved.provider}
                    activeModelId={resolved.model}
                    terminalHeight={terminalHeight}
                    showModelSelect={showModelSelect}
                    onSelect={(modelId) => {
                        configManager.setActiveModel(modelId);
                        handleConfigChange();
                        setShowModelSelect(false);
                    }}
                    onClose={() => setShowModelSelect(false)}
                />
            )}
        </box>
    );
}

const renderer = await createCliRenderer();
createRoot(renderer).render(<App />);
