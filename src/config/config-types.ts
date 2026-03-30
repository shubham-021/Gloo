import { Providers } from "../providers/index";

export interface ProfileConfig {
    provider: Providers;
    api_key: string;
    search_api?: string;
}

export interface GlooConfigSchema {
    global: {
        search_api?: string;
    };
    profiles: Record<string, ProfileConfig>;
    active: {
        profile: string;
        model: string;
    }
}

export interface ResolvedConfig {
    profileName: string;
    provider: Providers;
    apiKey: string;
    model: string;
    searchApi?: string;
    searchApiSource: 'profile' | 'global' | 'none';
}

export type ConfigStatus =
    | { ready: true }
    | { ready: false; reason: 'no_profile' | 'no_active_profiles' | 'missing_api_key' | 'no_model' }
