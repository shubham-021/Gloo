import { TextAttributes, TextareaRenderable } from "@opentui/core";
import { useKeyboard } from "@opentui/react";
import { useState, useRef, useEffect } from "react";
import { configManager } from "../../config/index.js";
import { Providers } from "../../providers/index.js";

type Screen =
    | { type: 'menu' }
    | { type: 'add-provider'; step: 'name' | 'provider' | 'api-key' | 'search-api' }
    | { type: 'switch-profile' }
    | { type: 'global-search-api' }
    | { type: 'edit-profile'; profileName: string };

interface SettingsProps {
    onClose: () => void;
    onConfigChange: () => void;
}

interface WizardData {
    name: string;
    provider: Providers | null;
    apiKey: string;
}

export function Settings({ onClose, onConfigChange }: SettingsProps) {
    const [screen, setScreen] = useState<Screen>({ type: 'menu' });
    const [wizardData, setWizardData] = useState<WizardData>({ name: '', provider: null, apiKey: '' });

    const handleBack = () => {
        setScreen({ type: 'menu' });
        setWizardData({ name: '', provider: null, apiKey: '' });
    };

    return (
        <box style={{
            position: 'absolute',
            left: 0, top: 0, right: 0, bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            <box style={{
                width: '70%',
                flexDirection: 'column',
                border: true,
                borderStyle: 'rounded',
                borderColor: '#99BB70',
                backgroundColor: '#151613',
                padding: 1,
                gap: 1,
            }}>
                {screen.type === 'menu' && (
                    <SettingsMenu onClose={onClose} onNavigate={setScreen} />
                )}
                {screen.type === 'add-provider' && (
                    <AddProviderWizard
                        step={screen.step}
                        wizardData={wizardData}
                        setWizardData={setWizardData}
                        setScreen={setScreen}
                        onBack={handleBack}
                        onComplete={() => { onConfigChange(); onClose(); }}
                    />
                )}
                {screen.type === 'switch-profile' && (
                    <SwitchProfile
                        onBack={handleBack}
                        onSwitch={() => { onConfigChange(); onClose(); }}
                    />
                )}
                {screen.type === 'global-search-api' && (
                    <GlobalSearchApi
                        onBack={handleBack}
                        onSave={() => { onConfigChange(); handleBack(); }}
                    />
                )}

                {screen.type === 'edit-profile' && (
                    <EditProfile
                        profileName={screen.profileName}
                        onBack={handleBack}
                        onSave={() => { onConfigChange(); handleBack(); }}
                    />
                )}
            </box>
        </box>
    );
}

function SettingsMenu({ onClose, onNavigate }: {
    onClose: () => void;
    onNavigate: (s: Screen) => void;
}) {
    const profiles = configManager.listProfiles();
    const hasProfiles = profiles.length > 0;

    const items = [
        { id: 'add-provider', label: 'Add Provider', enabled: true },
        { id: 'switch-profile', label: 'Switch Profile', enabled: profiles.length >= 2 },
        { id: 'global-search-api', label: 'Global Search API', enabled: true },
        { id: 'edit-profile', label: 'Edit Profile', enabled: hasProfiles }
    ];

    const enabledItems = items.filter(i => i.enabled);
    const [focusedIndex, setFocusedIndex] = useState(0);

    useKeyboard((key) => {
        if (key.name === 'escape') { onClose(); return; }

        if (key.name === 'up' || key.name === 'k') {
            setFocusedIndex(i => i > 0 ? i - 1 : enabledItems.length - 1);
        }
        if (key.name === 'down' || key.name === 'j') {
            setFocusedIndex(i => i < enabledItems.length - 1 ? i + 1 : 0);
        }
        if (key.name === 'return') {
            const selected = enabledItems[focusedIndex];
            if (selected.id === 'add-provider') {
                onNavigate({ type: 'add-provider', step: 'name' });
            } else if (selected.id === 'switch-profile') {
                onNavigate({ type: 'switch-profile' });
            } else if (selected.id === 'global-search-api') {
                onNavigate({ type: 'global-search-api' });
            } else if (selected.id === 'edit-profile') {
                const active = configManager.getActiveProfile();
                if (active) {
                    onNavigate({ type: 'edit-profile', profileName: active.name });
                }
            }
        }
    });

    return (
        <>
            <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>Settings</text>
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to close</text>
            </box>
            <box style={{ flexDirection: 'column' }}>
                {enabledItems.map((item, i) => (
                    <box key={item.id} style={{ flexDirection: 'row', gap: 1, paddingX: 1 }}>
                        <text style={{ fg: i === focusedIndex ? '#99BB70' : '#333633', attributes: TextAttributes.BOLD }}>
                            {i === focusedIndex ? '>' : ' '}
                        </text>
                        <text style={{ fg: i === focusedIndex ? '#BAD29C' : '#B5BAAF' }}>
                            {item.label}
                        </text>
                    </box>
                ))}
            </box>
        </>
    );
}

function AddProviderWizard({ step, wizardData, setWizardData, setScreen, onBack, onComplete }: {
    step: 'name' | 'provider' | 'api-key' | 'search-api';
    wizardData: WizardData;
    setWizardData: React.Dispatch<React.SetStateAction<WizardData>>;
    setScreen: (s: Screen) => void;
    onBack: () => void;
    onComplete: () => void;
}) {
    return (
        <>
            <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>Add Provider</text>
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to go back</text>
            </box>

            {/* Step indicators */}
            <box style={{ flexDirection: 'row', gap: 1, paddingX: 1 }}>
                {['name', 'provider', 'api-key', 'search-api'].map((s, i) => (
                    <text key={s} style={{
                        fg: s === step ? '#99BB70' : '#515A46',
                        attributes: s === step ? TextAttributes.BOLD : TextAttributes.DIM,
                    }}>
                        {`${i + 1}. ${s}`}
                    </text>
                ))}
            </box>

            {step === 'name' && (
                <WizardTextInput
                    label="Profile name"
                    placeholder="e.g. work, personal, default"
                    defaultValue="default"
                    onSubmit={(value) => {
                        setWizardData(d => ({ ...d, name: value }));
                        setScreen({ type: 'add-provider', step: 'provider' });
                    }}
                    onCancel={onBack}
                />
            )}

            {step === 'provider' && (
                <ProviderSelect
                    onSelect={(provider) => {
                        setWizardData(d => ({ ...d, provider }));
                        setScreen({ type: 'add-provider', step: 'api-key' });
                    }}
                    onCancel={onBack}
                />
            )}

            {step === 'api-key' && (
                <WizardTextInput
                    label={`API key for ${wizardData.provider}`}
                    placeholder="Paste your API key"
                    masked
                    onSubmit={(value) => {
                        setWizardData(d => ({ ...d, apiKey: value }));
                        setScreen({ type: 'add-provider', step: 'search-api' });
                    }}
                    onCancel={() => setScreen({ type: 'add-provider', step: 'provider' })}
                />
            )}

            {step === 'search-api' && (
                <WizardTextInput
                    label="Tavily Search API key"
                    placeholder="Press enter to skip (optional)"
                    optional
                    masked
                    onSubmit={(value) => {
                        configManager.createProfile(
                            wizardData.name,
                            wizardData.provider!,
                            wizardData.apiKey,
                            value || ''
                        );
                        onComplete();
                    }}
                    onCancel={() => setScreen({ type: 'add-provider', step: 'api-key' })}
                />
            )}
        </>
    );
}

function WizardTextInput({ label, placeholder, defaultValue, masked, optional, onSubmit, onCancel }: {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    masked?: boolean;
    optional?: boolean;
    onSubmit: (value: string) => void;
    onCancel: () => void;
}) {
    const textareaRef = useRef<TextareaRenderable | null>(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (textareaRef.current) {
            if (defaultValue) textareaRef.current.replaceText(defaultValue);
            textareaRef.current.focus();
        }
    }, []);

    useKeyboard((key) => {
        if (key.name === 'escape') { onCancel(); }
    });

    const handleSubmit = () => {
        if (submitted) return;
        const value = textareaRef.current?.plainText?.trim() ?? '';
        if (!value && !optional && !defaultValue) return;
        setSubmitted(true);
        onSubmit(value || defaultValue || '');
    };

    return (
        <box style={{ flexDirection: 'column', gap: 1, paddingX: 1 }}>
            <text style={{ fg: '#B5BAAF' }}>{label}</text>
            <box style={{
                border: true,
                borderStyle: 'rounded',
                borderColor: '#515A46',
                flexDirection: 'row',
                gap: 1,
                paddingX: 1,
            }}>
                <text fg='#515A46' flexShrink={0}>{'>'}</text>
                <textarea
                    ref={textareaRef}
                    width='100%'
                    placeholder={placeholder}
                    placeholderColor='#515A46'
                    focused
                    // mask={masked ? '*' : undefined}
                    style={{ paddingX: 1 }}
                    onSubmit={handleSubmit}
                    keyBindings={[{ name: 'return', action: 'submit' }]}
                />
            </box>
            {optional && (
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>
                    This is optional. Press enter to skip.
                </text>
            )}
        </box>
    );
}

function ProviderSelect({ onSelect, onCancel }: {
    onSelect: (provider: Providers) => void;
    onCancel: () => void;
}) {
    const providers = Object.values(Providers);
    const [focusedIndex, setFocusedIndex] = useState(0);

    useKeyboard((key) => {
        if (key.name === 'escape') { onCancel(); return; }
        if (key.name === 'up' || key.name === 'k') {
            setFocusedIndex(i => i > 0 ? i - 1 : providers.length - 1);
        }
        if (key.name === 'down' || key.name === 'j') {
            setFocusedIndex(i => i < providers.length - 1 ? i + 1 : 0);
        }
        if (key.name === 'return') {
            onSelect(providers[focusedIndex]);
        }
    });

    return (
        <box style={{ flexDirection: 'column', gap: 1, paddingX: 1 }}>
            <text style={{ fg: '#B5BAAF' }}>Select provider</text>
            {providers.map((p, i) => (
                <box key={p} style={{ flexDirection: 'row', gap: 1, paddingX: 1 }}>
                    <text style={{ fg: i === focusedIndex ? '#99BB70' : '#333633', attributes: TextAttributes.BOLD }}>
                        {i === focusedIndex ? '>' : ' '}
                    </text>
                    <text style={{ fg: i === focusedIndex ? '#BAD29C' : '#B5BAAF' }}>
                        {p}
                    </text>
                </box>
            ))}
        </box>
    );
}

function SwitchProfile({ onBack, onSwitch }: {
    onBack: () => void;
    onSwitch: () => void;
}) {
    const profiles = configManager.listProfiles();
    const activeProfile = configManager.getActiveProfile();
    const [focusedIndex, setFocusedIndex] = useState(0);

    useKeyboard((key) => {
        if (key.name === 'escape') { onBack(); return; }
        if (key.name === 'up' || key.name === 'k') {
            setFocusedIndex(i => i > 0 ? i - 1 : profiles.length - 1);
        }
        if (key.name === 'down' || key.name === 'j') {
            setFocusedIndex(i => i < profiles.length - 1 ? i + 1 : 0);
        }
        if (key.name === 'return') {
            configManager.setActiveProfile(profiles[focusedIndex].name);
            onSwitch();
        }
    });

    return (
        <>
            <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>Switch Profile</text>
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to go back</text>
            </box>
            <box style={{ flexDirection: 'column' }}>
                {profiles.map((p, i) => {
                    const isActive = p.name === activeProfile?.name;
                    return (
                        <box key={p.name} style={{ flexDirection: 'row', gap: 1, paddingX: 1 }}>
                            <text style={{
                                fg: i === focusedIndex ? '#99BB70' : '#333633',
                                attributes: TextAttributes.BOLD,
                            }}>
                                {i === focusedIndex ? '>' : ' '}
                            </text>
                            <text style={{ fg: i === focusedIndex ? '#BAD29C' : '#B5BAAF' }}>
                                {p.name}
                                <span fg='#515A46'>{` (${p.profile.provider})`}</span>
                                {isActive ? <span fg='#99BB70'>{' ✓'}</span> : ''}
                            </text>
                        </box>
                    );
                })}
            </box>
        </>
    );
}

function GlobalSearchApi({ onBack, onSave }: {
    onBack: () => void;
    onSave: () => void;
}) {
    const current = configManager.getGlobalSearchApi();
    const textareaRef = useRef<TextareaRenderable | null>(null);

    useEffect(() => {
        if (textareaRef.current) {
            if (current) textareaRef.current.replaceText(current);
            textareaRef.current.focus();
        }
    }, []);

    useKeyboard((key) => {
        if (key.name === 'escape') { onBack(); }
    });

    const handleSubmit = () => {
        const value = textareaRef.current?.plainText?.trim() ?? '';
        if (value) {
            configManager.setGlobalSearchApi(value);
            onSave();
        }
    };

    return (
        <>
            <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>Global Search API</text>
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to go back</text>
            </box>
            {current && (
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM, paddingX: 1 }}>
                    {`Current: ${'*'.repeat(8)}${current.slice(-4)}`}
                </text>
            )}
            <box style={{
                border: true,
                borderStyle: 'rounded',
                borderColor: '#515A46',
                flexDirection: 'row',
                gap: 1,
                paddingX: 1,
                marginX: 1,
            }}>
                <text fg='#515A46' flexShrink={0}>{'>'}</text>
                <textarea
                    ref={textareaRef}
                    width='100%'
                    placeholder="Enter your Tavily API key"
                    placeholderColor='#515A46'
                    focused
                    // mask={'*'}
                    style={{ paddingX: 1 }}
                    onSubmit={handleSubmit}
                    keyBindings={[{ name: 'return', action: 'submit' }]}
                />
            </box>
        </>
    );
}

function EditProfile({ profileName, onBack, onSave }: {
    profileName: string;
    onBack: () => void;
    onSave: () => void;
}) {
    const profile = configManager.getProfile(profileName);
    const fields = [
        { id: 'api-key', label: 'API Key' },
        { id: 'search-api', label: 'Search API Key' },
    ];

    const [focusedIndex, setFocusedIndex] = useState(0);
    const [editingField, setEditingField] = useState<string | null>(null);

    useKeyboard((key) => {
        if (editingField) return; // let the text input handle keys
        if (key.name === 'escape') { onBack(); return; }
        if (key.name === 'up' || key.name === 'k') {
            setFocusedIndex(i => i > 0 ? i - 1 : fields.length - 1);
        }
        if (key.name === 'down' || key.name === 'j') {
            setFocusedIndex(i => i < fields.length - 1 ? i + 1 : 0);
        }
        if (key.name === 'return') {
            setEditingField(fields[focusedIndex].id);
        }
    });

    if (!profile) {
        return <text style={{ fg: '#f87171' }}>Profile "{profileName}" not found.</text>;
    }

    const maskedKey = (key?: string) =>
        key ? `${'*'.repeat(8)}${key.slice(-4)}` : 'not set';

    if (editingField) {
        const isApiKey = editingField === 'api-key';
        return (
            <WizardTextInput
                label={`${isApiKey ? 'API Key' : 'Search API Key'} for ${profileName}`}
                placeholder={`Enter new ${isApiKey ? 'API' : 'search API'} key`}
                masked
                optional={!isApiKey}
                onSubmit={(value) => {
                    if (isApiKey) {
                        configManager.updateProfileApiKey(profileName, value);
                    } else {
                        configManager.updateProfileSearchApiKey(profileName, value);
                    }
                    setEditingField(null);
                    onSave();
                }}
                onCancel={() => setEditingField(null)}
            />
        );
    }

    return (
        <>
            <box style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <text style={{ fg: '#99BB70', attributes: TextAttributes.BOLD }}>Edit Profile</text>
                <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>esc to go back</text>
            </box>

            <box style={{ flexDirection: 'column', paddingX: 1, gap: 0 }}>
                <text style={{ fg: '#B5BAAF' }}>
                    {profileName}
                    <span fg="#515A46">{` (${profile.provider})`}</span>
                </text>
            </box>

            <box style={{ flexDirection: 'column' }}>
                {fields.map((field, i) => (
                    <box key={field.id} style={{ flexDirection: 'row', gap: 1, paddingX: 1 }}>
                        <text style={{
                            fg: i === focusedIndex ? '#99BB70' : '#333633',
                            attributes: TextAttributes.BOLD,
                        }}>
                            {i === focusedIndex ? '>' : ' '}
                        </text>
                        <text style={{ fg: i === focusedIndex ? '#BAD29C' : '#B5BAAF' }}>
                            {field.label}
                        </text>
                        <text style={{ fg: '#515A46', attributes: TextAttributes.DIM }}>
                            {field.id === 'api-key'
                                ? maskedKey(profile.api_key)
                                : maskedKey(profile.search_api)}
                        </text>
                    </box>
                ))}
            </box>

            <text style={{ fg: '#515A46', attributes: TextAttributes.DIM, paddingX: 1 }}>
                press enter to edit
            </text>
        </>
    );
}

