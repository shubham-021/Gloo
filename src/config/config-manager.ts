import Conf from "conf";
import { Providers } from "../providers/index";
import type { ProfileConfig, GlooConfigSchema, ResolvedConfig, ConfigStatus } from "./config-types";
import { getDefaultModelForProvider, isValidModelForProvider } from "./model-registry";

class ConfigManager {
    private conf: Conf<any>;

    constructor() {
        this.conf = new Conf({ projectName: 'gloo-cli' });
    }

    createProfile(name: string, provider: Providers, apiKey: string, searchApi: string): void {
        const profile: ProfileConfig = { provider, api_key: apiKey };
        if (searchApi) profile.search_api = searchApi;

        this.conf.set(`profiles.${name}`, profile);

        if (!this.conf.has('active.profile')) {
            this.setActiveProfile(name);
        }
    }

    deleteProfile(name: string): void {
        this.conf.delete(`profiles.${name}` as any);

        if (this.conf.get('active.profile') === name) {
            this.conf.delete('active' as any);

            const remaining = this.listProfiles();
            if (remaining.length > 0) {
                this.setActiveProfile(remaining[0].name);
            }
        }
    }

    getProfile(name: string): ProfileConfig | undefined {
        return this.conf.get(`profiles.${name}`) as ProfileConfig | undefined;
    }

    listProfiles(): { name: string; profile: ProfileConfig }[] {
        const profiles = (this.conf.get('profiles') || {}) as Record<string, ProfileConfig>;
        return Object.entries(profiles).map(([name, profile]) => ({ name, profile }));
    }

    updateProfileApiKey(name: string, apiKey: string): void {
        if (!this.getProfile(name)) return;

        this.conf.set(`profiles.${name}.api_key`, apiKey);
    }

    updateProfileSearchApiKey(name: string, searchApi: string): void {
        if (!this.getProfile(name)) return;

        this.conf.set(`profiles.${name}.search_api`, searchApi);
    }

    setActiveProfile(name: string): void {
        const profile = this.getProfile(name);
        if (!profile) return;

        this.conf.set('active.profile', name);
        this.conf.set('active.model', getDefaultModelForProvider(profile.provider));
    }

    setActiveModel(modelId: string): void {
        const activeProfile = this.getActiveProfile();
        if (!activeProfile) return;
        if (!isValidModelForProvider(modelId, activeProfile.profile.provider)) return;
        this.conf.set('active.model', modelId);
    }

    getActiveProfile(): { name: string; profile: ProfileConfig } | undefined {
        const name = this.conf.get('active.profile') as string | undefined;
        if (!name) return undefined;
        const profile = this.getProfile(name);
        if (!profile) return undefined;
        return { name, profile };
    }

    getActiveModelId(): string | undefined {
        return this.conf.get('active.model') as string | undefined;
    }

    setGlobalSearchApi(key: string): void {
        this.conf.set('global.search_api', key);
    }

    getGlobalSearchApi(): string | undefined {
        return this.conf.get('global.search_api') as string | undefined;
    }

    resolve(): ResolvedConfig | null {
        const active = this.getActiveProfile();
        if (!active) return null;

        const modelId = this.getActiveModelId();
        if (!modelId) return null;

        const { name, profile } = active;

        // Search API: profile → global → none
        let searchApi: string | undefined;
        let searchApiSource: ResolvedConfig['searchApiSource'] = 'none';

        if (profile.search_api) {
            searchApi = profile.search_api;
            searchApiSource = 'profile';
        } else {
            const globalSearch = this.getGlobalSearchApi();
            if (globalSearch) {
                searchApi = globalSearch;
                searchApiSource = 'global';
            }
        }

        return {
            profileName: name,
            provider: profile.provider,
            apiKey: profile.api_key,
            model: modelId,
            searchApi,
            searchApiSource,
        };
    }

    isConfigured(): boolean {
        return this.resolve() !== null;
    }

    getConfigStatus(): ConfigStatus {
        const profiles = this.listProfiles();
        if (profiles.length === 0) return { ready: false, reason: 'no_profiles' };

        const active = this.getActiveProfile();
        if (!active) return { ready: false, reason: 'no_active_profile' };
        if (!active.profile.api_key) return { ready: false, reason: 'missing_api_key' };

        const model = this.getActiveModelId();
        if (!model) return { ready: false, reason: 'no_model' };

        return { ready: true };
    }

    private migrateFromLegacy(): void {
        // Already migrated or fresh install
        if (this.conf.has('profiles') || this.conf.has('global')) return;
        const defaultName = this.conf.get('default') as string | undefined;
        if (!defaultName) return;

        const legacy = this.conf.get(defaultName) as {
            provider?: Providers;
            model?: string;
            api?: string;
            search_api?: string;
        } | undefined;

        if (!legacy || !legacy.provider || !legacy.api) return;
        // Migrate
        const profile: ProfileConfig = {
            provider: legacy.provider,
            api_key: legacy.api,
        };

        if (legacy.search_api) {
            this.conf.set('global.search_api', legacy.search_api);
        }

        this.conf.set(`profiles.${defaultName}`, profile);
        this.conf.set('active.profile', defaultName);
        this.conf.set('active.model', legacy.model || getDefaultModelForProvider(legacy.provider));
        // Clean up old keys
        this.conf.delete(defaultName as any);
        this.conf.delete('default' as any);
    }
}

export const configManager = new ConfigManager();