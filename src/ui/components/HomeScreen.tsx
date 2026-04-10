import { TextAttributes } from "@opentui/core";
import type { ResolvedConfig } from "../../config/index.js";
import { getModelMeta } from "../../config/index.js";

interface HomeScreenProps {
    resolvedConfig: ResolvedConfig;
    terminalWidth: number;
    children: React.ReactNode;
}

export function HomeScreen({ resolvedConfig, terminalWidth, children }: HomeScreenProps) {
    const modelMeta = getModelMeta(resolvedConfig.model);
    const cwd = process.cwd();
    const shortCwd = cwd.split('/').slice(-2).join('/');

    return (
        <box style={{
            width: '100%',
            flexGrow: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <box style={{
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                width: terminalWidth > 80 ? '60%' : '90%',
            }}>
                <ascii-font
                    text="Gloo"
                    font="tiny"
                    color="#BAD29C"
                    alignItems="center"
                />

                {/* Model & Profile Info */}
                <text style={{ fg: '#515A46' }}>
                    <span fg="#B5BAAF">{modelMeta?.label ?? resolvedConfig.model}</span>
                    {modelMeta ? ` · ${(modelMeta.contextWindow / 1000)}K` : ''}
                    {'  '}
                    <span fg="#515A46">{resolvedConfig.profileName}</span>
                </text>

                <text style={{ fg: '#515A46' }}>
                    {'in '}
                    <span fg="#99BB70">{shortCwd}</span>
                </text>

                <box style={{
                    width: '100%',
                    marginTop: 1,
                    flexDirection: 'column',
                    flexShrink: 0,
                }}>
                    {children}
                </box>

                <box style={{
                    flexDirection: 'row',
                    gap: 2,
                    marginTop: 1,
                }}>
                    <text style={{ fg: '#515A46' }}>
                        <span fg="#99BB70" attributes={TextAttributes.BOLD}>Ctrl+G → M</span>
                        {' model'}
                    </text>
                    <text style={{ fg: '#515A46' }}>
                        <span fg="#99BB70" attributes={TextAttributes.BOLD}>Ctrl+G → S</span>
                        {' settings'}
                    </text>
                    <text style={{ fg: '#515A46' }}>
                        <span fg="#99BB70" attributes={TextAttributes.BOLD}>Ctrl+G → H</span>
                        {' help'}
                    </text>
                </box>
            </box>
        </box>
    );
}
